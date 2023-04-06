const express = require('express')
const router = express.Router()

let Plants = require('../Model/plantModel')

//http://localhost:3001/api/plants/index
//returns all plants with ids
router.route('/index').get((req,res) => {
    Plants.find()
        .then(Plants => res.json(Plants))
        .catch(err => res.status(400).json('Error: ' + err))
})

//get list of all Plants name
// http://localhost:3001/api/plants/name
router.route('/name').get((req, res) => {
    Plants.find({}, 'name')
        .then(plants => {
            const plantNames = plants.map(plant => plant.name)
            res.json(plantNames)
        })
        .catch(err => res.status(400).json('Error: ' + err))
})

//Register new Plant 
// http://localhost:3001/api/plants
router.route('/').post((req, res) => {
    const name = req.body.name;
    const species = req.body.species;
    const cultivar = req.body.cultivar;

    const newPlant = new Plants({
        name,
        species,
        cultivar,
    })

    newPlant.save()
    .then(() => res.json('Plants added!'))
    .catch(err => res.status(400).json('Error: ' + err))
})

// returns name,species,cultivar that is specified by id
router.route('/:id').get((req, res) => {
    Plants.findById(req.params.id)
        .select('name species cultivar')
        .then(result => res.json(result))
        .catch(err => res.status(400).json('Error: ' + err))
  });


//update Plant lets user update name only if marked as dead user cannont update
// http://localhost:3001/plants/${id}/
router.route('/:id').put((req, res) => {
    Plants.findById(req.params.id)
        .then(plants => {
            if (plants.isDead) {
                throw new Error('Cannot update a dead plant');
            }
            plants.name = req.body.name;
            if (req.body.species || req.body.cultivar) {
                throw new Error('Cannot update species or cultivar fields for a live or dead plant');
            }
            return plants.save();
        })
        .then(() => res.json('Plant updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//Marks plant as dead/removed
// http://localhost:3001/plants/${id}/status
router.route('/:id/status').put((req, res) => {
    Plants.findById(req.params.id)
        .then(plant => {
            if (plant.isDead) {
                throw new Error('Plant is already marked as dead/removed');
            }
            plant.isDead = true;
            plant.events = undefined;
            plant.harvest = undefined;
            return plant.save();
        })
        .then(() => res.json('Plant status changed!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//adds event info for a plant
// http://localhost:3001/plants/${id}/events
router.route('/:id/events').post((req, res) => {
    const plantId = req.params.id;
    const eventType = req.body.eventType;
    const eventDescription = req.body.eventDescription;
    const eventDate = new Date(req.body.eventDate);
    
    Plants.findById(plantId)
        .then(plant => {
            if (plant.isDead) {
                throw new Error('Error: Plant is dead. Cannot add event.');
            } else {
                plant.events.push({
                    eventType: eventType,
                    eventDescription: eventDescription,
                    eventDate: eventDate
                });
                return plant.save();
            }
        })
        .then(() => res.json('Event added!'))
        .catch(err => res.status(400).json('Error: ' + err)
        );
});

// get list of events for a particular plant between a startDate and an endDate
///plants/${Id}/events?startDate=2022-03-01&endDate=2023-03-08
router.route('/:id/events').get((req, res) => {
    const plantId = req.params.id;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    Plants.findById(plantId)
        .then(plant => {
        const events = plant.events.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= startDate && eventDate <= endDate;
        });

        res.json(events);
        })
        .catch(err => res.status(400).json('Error: ' + err));
    });

//delete event based off event id
//// http://localhost:3001/plants/${id}/events/${eventid}
router.route('/:id/events/:eventId').delete((req, res) => {
    const plantId = req.params.id;
    const eventId = req.params.eventId;

    Plants.findById(plantId)
        .then(plant => {
        // Find the index of the event with the given ID
        const eventIndex = plant.events.findIndex(event => event._id == eventId);
        if (eventIndex === -1) {
            return res.status(404).json('Event not found');
        }

        // Remove the event from the events array
        plant.events.splice(eventIndex, 1);

        // Save the updated plant object
        plant.save()
            .then(() => res.json('Event deleted'))
            .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
    });

//lets user add harvests for a plant
// http://localhost:3001/plants/${id}/harvests/add
router.route('/:id/harvests').post((req, res) => {
    const plantId = req.params.id;
    const weight = req.body.weight;
    const quantity = req.body.quantity;
    const date = new Date(req.body.date);
    
    Plants.findById(plantId)
        .then(plant => {
            if (plant.isDead) {
                throw new Error('Error: Plant is dead. Cannot add harvest.');
        } else {
            plant.harvest.push({
                weight: weight,
                quantity: quantity,
                date: date
        });
    
        return plant.save();
    }
        })
        .then(() => res.json('Haverst added!'))
        .catch(err => res.status(400).json('Error: ' + err));
    });

//lets user get harvests for a particular plant.
 // http://localhost:3001/plants/${id}/harvests
router.route('/:id/harvests').get((req, res) => {
    const plantId = req.params.id;

    Plants.findById(plantId)
        .then(plant => {
            if(!plant){
                return res.status(404).json('Plant/Harvest not found')
            }    
        const harvests = plant.harvest
        res.json(harvests);
        })
        .catch(err => res.status(400).json('Error: ' + err));
    });

//lets user look up a harvests for a particular day
// http://localhost:3001//plants/harvests?date=yyyy-mm-dd
router.route('/harvests').get((req, res) => {
    const harvestDate = req.query.date;
    
    Plants.find()
        .then(plants => {
            let harvests = [];
            plants.forEach(plant => {
                plant.harvest.forEach(harvest => {
                    const harvestDateStr = harvest.date.toISOString().substring(0, 10);
                    if (harvestDateStr === harvestDate) {
                        harvests.push(harvest);
                }
                });
            });
            
            res.json(harvests);
            })
            .catch(err => res.status(400).json({ message: 'Error: ' + err }));
    });



module.exports = router



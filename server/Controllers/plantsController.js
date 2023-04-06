const  asyncHandler = require('express-async-handler')
const Plant = require('../Model/plantModel')

//@desc Get plans
//@route GET /api/Plants
const getPlants = asyncHandler( async(req, res) =>{
    const plants = await Plant.find()
    
    res.status(200).json(plants)
})

//@desc Set plans
//@route POST /api/Plants
const setPlants = asyncHandler( async(req, res) =>{
    if(!req.body.text){
        res.status(400)
        throw new Error('add text')
    }
    const plant = await Plant.create({
        text: req.body.text
    })

    res.status(200).json(plant)
})

//@desc UPDATE plans
//@route GET /api/Plants
const updatePlants = asyncHandler( async(req, res) =>{
    const plant = await Plant.findById(req.params.id)

    if(!plant){
        res.status(400)
        throw new Error('Plant not found')
    }
    const updatePlants = await Plant.findByIdAndUpdate(req.params.id,
        req.body, {
            new: true,
        })
        res.status(200).json(updatePlants)
})

//@desc Delete plans
//@route delete /api/Plants
const deletePlants = asyncHandler( async(req, res) =>{
    const plant = await Plant.findById(req.params.id)

    if(!plant){
        res.status(400)
        throw new Error('Does not exist')
    }
    await plant.remove()
    res.status(200).json({id: req.params.id})
})


module.exports = {
    getPlants,
    setPlants,
    updatePlants,
    deletePlants,
}
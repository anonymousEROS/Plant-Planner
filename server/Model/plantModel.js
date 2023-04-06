const mongoose = require('mongoose')

const plantSchema = mongoose.Schema({
    name: { type: String, required: true },
    species: { type: String, required: true },
    cultivar: { type: String, required: true },
    isDead: {type: Boolean, required: false},
    events: [
        {
          eventType: { type: String, required: true },
          eventDescription: { type: String, required: true },
          eventDate: { type: Date, required: true }
        }
      ],
      harvest: [
        {
          weight: { type: Number, required: true },
          quantity: { type: Number, required: true },
          date: { type: Date, required: true }
        }
      ]
    
}, {
    timestamps: true,
}) 

module.exports = mongoose.model('Plant', plantSchema)
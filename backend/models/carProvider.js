const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  model: { type: String, required: true },
  rent: { type: Number, required: true },
  regdNumber: { type: String, required: true },
  image: { type: String, default: '' },
  bookedDates: [{ type: Date }]
});

const CarProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phn: { type: String, required: true },
  cars: [CarSchema]  // <-- Important: array of cars
});

module.exports = mongoose.model('CarProvider', CarProviderSchema);

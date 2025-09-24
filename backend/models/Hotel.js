const mongoose = require('mongoose');
const { Schema } = mongoose;

const hotelSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phn: { type: String, required: true },
  image: { type: String },
  location: { type: String },
  address: { type: String },
  rooms: { type: Number, required: true },
  rent: { type: Number, required: true },
  availability: [
    {
      date: { type: Date, required: true },
      availRooms: { type: Number, required: true }
    }
  ],
  date: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;

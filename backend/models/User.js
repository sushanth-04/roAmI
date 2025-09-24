const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookedHotelSchema=new Schema({
  hotel: {type:Schema.Types.ObjectId,ref:'Hotel',required:true},
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dates: { type: [Date], required: true },
  rooms: {type: Number},
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending'}
})

const bookedCarSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'CarProvider', required: true },
  dates: { type: [Date], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' }
});

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phn: { type: String},
  password: { type: String, required: true },
  plan: Object,
  bookedCars: { type: [bookedCarSchema], default: [] },
  bookedHotel: { type: [bookedHotelSchema], default: [] },
  date: { type: Date, default: Date.now }
});


const User = mongoose.model('user', userSchema);
module.exports = User;
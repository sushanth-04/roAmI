const express = require('express');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser'); // Middleware for authentication
const CarProvider = require('../models/carProvider');  // Fetch car from provider model
const User = require('../models/User');  // User model contains embedded bookings
const router = express.Router();
const mongoose=require('mongoose')
const fetchcarprovider = require('../middleware/fetchcarprovider');
const fetchhotel=require('../middleware/fetchHotel')


router.get("/getmyhotelpendingrequests", fetchhotel, async (req, res) => {
    try {
        const hotelId = req.hotel._id; // Authenticated hotel ID from token

        // Find users with pending bookings for this hotel
        const users = await User.find({ "bookedHotel.hotel": hotelId });

        let pendingRequests = [];
        users.forEach(user => {
            user.bookedHotel.forEach(booking => {
                if (booking.hotel.equals(hotelId) && booking.status === "pending") {
                    pendingRequests.push({
                        _id: booking._id,  // ✅ Ensure booking ID is included
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                        dates: booking.dates,
                        rooms: booking.rooms,
                        status: booking.status
                    });
                }
            });
        });

        return res.json({ success: true, pendingRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/getmypendingrequests', fetchcarprovider, async (req, res) => {
    try {
        const carProviderId = req.carprovider._id; // Authenticated provider ID
        
        const users = await User.find({ 'bookedCars.provider': carProviderId });

        let pendingRequests = [];
        users.forEach(user => {
            user.bookedCars.forEach(booking => {
                if (booking.provider.equals(carProviderId) && booking.status === 'pending') {
                    pendingRequests.push({
                        _id: booking._id,  // ✅ Ensure booking ID is included
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                        car: booking.car,
                        dates: booking.dates,
                        status: booking.status
                    });
                }
            });
        });

        return res.json({ success: true, pendingRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route: PUT /api/bookings/updatestatus/:bookingId
router.put('/updatestatus/:bookingId', fetchcarprovider, async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
  
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
  
    try {
      const updatedBooking = await User.findOneAndUpdate(
        { "bookedCars._id": bookingId },
        { $set: { "bookedCars.$.status": status } },
        { new: true }
      );
  
      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
  
      res.json({ success: true, message: "Booking updated", updatedBooking });
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  router.put('/updatehotelbooking/:bookingId', fetchhotel, async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!status || !['confirmed', 'canceled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    // Validate booking ID
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
        // Update booking status
        const updatedBooking = await User.findOneAndUpdate(
            { "bookedHotel._id": bookingId, "bookedHotel.hotel": req.hotel._id },
            { $set: { "bookedHotel.$.status": status } },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: "Booking not found or not associated with this hotel" });
        }

        res.json({ success: true, message: "Booking status updated", updatedBooking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


  




// Route: POST /api/bookings/addnewcarbooking
router.post('/addnewcarbooking', fetchuser, [
    body('carId', 'Valid carId is required').isMongoId(),
    body('dates', 'At least one valid date is required').isArray({ min: 1 })
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation Errors:', errors.array());  // Log errors for debugging
            return res.status(400).json({ errors: errors.array() });
        }

        const { carId, dates } = req.body;
        const userId = req.user.id;

        // Fetch the car provider that owns this car
        let provider = await CarProvider.findOne({ "cars._id": carId });
        if (!provider) return res.status(404).json({ error: "Car not found" });

        // Find the specific car within the provider's cars array
        let car = provider.cars.id(carId);
        if (!car) return res.status(404).json({ error: "Car not found within provider's records" });

        // Check if any date is already booked
        const isAlreadyBooked = dates.some(date => car.bookedDates.includes(new Date(date).toISOString()));
        if (isAlreadyBooked) return res.status(400).json({ error: "Some dates are already booked" });

        // Fetch the user to update bookings
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Add the booking inside the user's `bookedCars` array
        user.bookedCars.push({
            user: userId,
            car: carId,
            provider: provider._id,
            dates,
            status: 'pending'
        });

        await user.save();

        // Update booked dates in the car inside the provider's array
        car.bookedDates.push(...dates);
        await provider.save();  // Save the provider to persist changes

        res.status(201).json({ success: true, message: "Booking successful", bookedCars: user.bookedCars });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;

const express=require('express')
const User=require('../models/User')
const CarProvider=require('../models/carProvider')
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')
const Hotel=require('../models/Hotel')
const mongoose = require('mongoose');
const JWT_SECRET='Bennyi$ag00dguy'
const router=express.Router();


router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must contain at least 5 characters').isLength({ min: 5 }),
    body('phn', 'Enter a valid phone number').isLength({ min: 10 }) // Add validation for phone number
], async (req, res) => {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if user already exists with the same email
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry, a user with this email already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            phn: req.body.phn,  // Store phone number
        });

        // Create auth token
        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.json({ authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});



//route-2: login a user /api/auth/login
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
],async (req,res)=>{
    //if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email,password}=req.body
    try{ 
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Please try to login with correct credentials"})
        }
        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error:"Please try to login with correct credentials"})
        }
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET)
        console.log(authtoken);
        res.json({authtoken})
        
    }catch(error){
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})  




// route-3 Get loggedin user details using: POST '/api/auth/getuser'
router.post('/getuser',fetchuser,async (req,res)=>{
    try {
        userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})


router.post('/addplan', fetchuser, async (req, res) => {
    try {
        console.log("User from token:", req.user);

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User not authenticated properly" });
        }

        const userId = req.user.id;
        const { plan } = req.body;

        console.log("Finding user in DB...");
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found in DB!");
            return res.status(404).json({ error: "User not found" });
        }

        console.log("User found:", user);
        console.log("Updating plan:", plan);

        // ✅ Replace the old plan with the new one
        user.plan = plan;

        // ✅ Save the updated user document
        await user.save();
        console.log("Updated user document:", user);

        res.json({ message: "Plan updated successfully", plan: user.plan });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


// route-4: Get user plan using: POST '/api/auth/getplan'
router.post('/getplan', fetchuser, async (req, res) => {
    try {
        // Get user ID from the token
        const userId = req.user.id;

        // Find the user in the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send the user's plan back in the response
        res.json({ plan: user.plan });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/bookedcars', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user along with bookedCars
        const user = await User.findById(userId).lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let enrichedBookedCars = [];

        // Iterate over each booked car and fetch car details from CarProvider
        for (let bookedCar of user.bookedCars) {
            const provider = await CarProvider.findById(bookedCar.provider).lean();

            if (provider) {
                // Find the car details inside provider.cars array
                const carDetails = provider.cars.find(car => car._id.toString() === bookedCar.car.toString());

                // If car details are found, attach them
                enrichedBookedCars.push({
                    ...bookedCar,
                    carDetails: carDetails || null,  // Attach car details if found, else null
                    providerDetails: {
                        name: provider.name,
                        email: provider.email,
                        phn: provider.phn
                    }
                });
            }
        }

        res.json({ bookedCars: enrichedBookedCars });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/gethotelbookings', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user along with bookedHotel
        const user = await User.findById(userId).lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Directly return the bookedHotel details (You can enhance this part if needed)
        res.json({ bookedHotels: user.bookedHotel });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


// Assuming you're using express.js
router.get('/gethoteldetails/:hotelId', async (req, res) => {
    try {
      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found' });
      }
      console.log("Hotel image path:", hotel.image);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  



module.exports=router
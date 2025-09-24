// routes/carProviderRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchcarprovider = require('../middleware/fetchcarprovider');
const CarProvider = require('../models/carProvider');  // Adjust the path as per your directory structure
const User = require('../models/User');  // Adjust the path as per your directory structure
require('dotenv').config();

const JWT_SECRET = "Bennyi$ag00dguy";
const router = express.Router();

// Route-1: Create a new car provider /api/auth/create
router.post('/create', [
  body('name', 'Enter a valid name').isLength({ min: 5 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must contain at least 5 characters').isLength({ min: 5 }),
  body('phn', 'Enter a valid phone number').isMobilePhone(),  // Validate phone number
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the car provider already exists
    let existingCarProvider = await CarProvider.findOne({ email: req.body.email });
    if (existingCarProvider) {
      return res.status(400).json({ error: "Sorry, a car provider with this email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new car provider
    let newCarProvider = await CarProvider.create({
      name: req.body.name,
      email: req.body.email,
      phn: req.body.phn,
      password: hashedPassword,
    });

    // Prepare JWT payload
    const data = {
      carprovider: { id: newCarProvider.id }
    };
    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({ authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route-2: Login a car provider /api/auth/login
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    // Check if car provider exists
    let carProvider = await CarProvider.findOne({ email });
    if (!carProvider) {
      return res.status(400).json({ error: "Incorrect credentials" });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, carProvider.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect credentials" });
    }

    // Prepare JWT payload
    const data = {
      carprovider: { id: carProvider.id }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route-3: Get logged-in car provider details using: POST '/api/auth/getcarprovider'
router.post('/getcarprovider', fetchcarprovider, async (req, res) => {
  try {
    // Get the car provider's details excluding the password
    const carProvider = await CarProvider.findById(req.carprovider.id).select("-password");
    res.json(carProvider);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Route to add a new car with an image
router.post(
    '/addcar', 
    fetchcarprovider, 
    upload.single('image'),
    [
        body('model', 'Car model is required').notEmpty(),
        body('rent', 'Car rent must be a number').isNumeric(),
        body('regdNumber', 'Registration number is required').notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { model, rent, regdNumber } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';

        try {
            // Find the logged-in car provider
            let carProvider = await CarProvider.findById(req.carprovider.id);

            if (!carProvider) {
                return res.status(400).json({ error: "Car provider not found" });
            }

            // Create a new car object
            const newCar = {
                model,
                rent,
                regdNumber,
                image,
                bookedDates: [] 
            };

            // Add the car to the car provider's cars array
            carProvider.cars.push(newCar);
            
            // Save the updated car provider document
            await carProvider.save();

            // Respond with the updated car provider data
            res.json({ cars: carProvider.cars });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

// Serve static files (images)
router.use('/uploads', express.static(uploadDir));
    


  // Route-5: Get all cars for the logged-in car provider /api/auth/getcars
  router.get('/getcars', fetchcarprovider, async (req, res) => {
    try {
      let carProvider = await CarProvider.findById(req.carprovider.id);
      if (!carProvider) {
        return res.status(400).json({ error: "Car provider not found" });
      }
      res.json(carProvider.cars);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


  // Route-6: Get all cars of all car providers /api/auth/getallcars
router.get('/getallcars', async (req, res) => {
    try {
      // Find all car providers
      let carProviders = await CarProvider.find().select("cars");
  
      // If no car providers found
      if (!carProviders || carProviders.length === 0) {
        return res.status(400).json({ error: "No cars found" });
      }
  
      // Extract cars from all car providers
      let allCars = carProviders.reduce((acc, provider) => {
        return acc.concat(provider.cars); // Merge all cars into a single array
      }, []);
  
      // Respond with all cars
      res.json(allCars);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  
// Route to get all bookings under the concerned provider
router.get("/getbookings", fetchcarprovider, async (req, res) => {
  try {
    // Step 1: Get CarProvider ID from token
    const carProviderId = req.carprovider.id;
    console.log("CarProvider ID:", carProviderId); // Debugging

    // Step 2: Fetch the provider and extract their cars
    const carProvider = await CarProvider.findById(carProviderId).select("cars");

    if (!carProvider) {
      return res.status(404).json({ error: "Car provider not found" });
    }

    // Step 3: Fetch users with bookings under this provider
    const users = await User.find({ "bookedCars.provider": carProviderId })
      .select("bookedCars name email");

    if (!users.length) {
      return res.status(404).json({ error: "No bookings found for this provider" });
    }

    // Step 4: Extract and format bookings with car details
    let allBookings = [];
    users.forEach((user) => {
      user.bookedCars.forEach((booking) => {
        if (booking.provider.toString() === carProviderId) {
          // Find the matching car inside the provider's `cars` array
          const carDetails = carProvider.cars.find(car => car._id.toString() === booking.car.toString());

          allBookings.push({
            _id: booking._id,
            car: booking.car, // Reference to Car ID
            model: carDetails?.model || "N/A",
            rent: carDetails?.rent || "N/A",
            regdNumber: carDetails?.regdNumber || "N/A",
            image: carDetails?.image || "N/A",
            user: user.name,
            userEmail: user.email,
            dates: booking.dates,
            status: booking.status
          });
        }
      });
    });

    console.log("All Bookings with Car Details:", JSON.stringify(allBookings, null, 2));

    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
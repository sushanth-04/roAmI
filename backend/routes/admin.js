const express = require('express');
const router = express.Router();
const CarProvider = require('../models/carProvider');  // Import CarProvider model

// Route to get all car providers
router.get('/carproviders', async (req, res) => {
  try {
    const carProviders = await CarProvider.find();  // Fetch all car providers
    res.status(200).json(carProviders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching car providers', error: err });
  }
});

const Hotel = require('../models/Hotel');  // Import Hotel model

// Route to get all hotels
router.get('/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find();  // Fetch all hotels
    res.status(200).json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hotels', error: err });
  }
});

const User = require('../models/User');

router.get('/users', async (req, res) => {
    try {
      const users = await User.find();  // Fetch all users
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  });
  


module.exports = router;

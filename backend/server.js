const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

connectToMongo();

// Routes
app.use('/api/auth', require('./routes/auth')); // User authentication
app.use('/api/carProviders', require('./routes/carProviders')); // Car provider auth
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/bookings', require('./routes/bookings'));  // Add this line
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/admin',require('./routes/admin'))

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Bennyi$ag00dguy';

const fetchcarprovider = (req, res, next) => {
  const token = req.header('auth-token');
  console.log("Token received in middleware:", token);

  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token data:", data);

    // Store minimal info from token in req.carprovider for further use
    req.carprovider = data.carprovider;

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchcarprovider;

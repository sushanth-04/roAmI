const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Bennyi$ag00dguy';

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');

    // Debugging logs
    console.log("Received auth-token:", token);

    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token data:", data); // Log decoded token

        req.user = data.user;  // Ensure this matches what was signed in JWT

        if (!req.user) {
            return res.status(401).json({ error: "User data missing in token" });
        }

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ error: "Invalid Token" });
    }
};

module.exports = fetchuser;

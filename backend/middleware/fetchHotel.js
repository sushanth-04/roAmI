const jwt = require("jsonwebtoken");
const Hotel = require("../models/Hotel"); // Ensure correct import
const JWT_SECRET = "Bennyi$ag00dguy";

const fetchHotel = async (req, res, next) => {
    const token = req.header("auth-token");

    if (!token) {
        return res.status(401).json({ error: "Access denied, token missing" });
    }

    try {
        console.log("🔍 Received Token:", token); // ✅ Log token for debugging

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Decoded Token:", decoded); // ✅ Check if token decodes correctly

        if (!decoded.hotel || !decoded.hotel.id) {
            return res.status(401).json({ error: "Invalid token structure" });
        }

        req.hotel = await Hotel.findById(decoded.hotel.id).select("-password");

        if (!req.hotel) {
            return res.status(401).json({ error: "Hotel not found" });
        }

        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = fetchHotel;

// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get Token from Header
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ error: "Access Denied. Please Login." });

    try {
        // 2. Verify Token
        const verified = jwt.verify(token, "SECRET_KEY_123"); // Must match key in auth.js
        req.user = verified; // Attach user ID to the request
        next(); // Allow them to pass
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};
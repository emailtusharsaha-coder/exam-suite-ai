const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        // 1. Get user details using the ID from the previous auth check
        const user = await User.findById(req.user.id);

        // 2. Check if they are an Admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied. Admins only." });
        }

        // 3. Allow them to pass
        next();
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
};
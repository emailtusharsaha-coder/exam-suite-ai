// routes/auth.js
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        // Encrypt the password (never save plain text!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        // Create a "Session Token" (Like a VIP wristband)
        const token = jwt.sign({ id: user._id }, "SECRET_KEY_123");
        
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. GET USER PROFILE (Protected Route)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Find the user by the ID stored in the token (req.user.id)
        // .select('-password') means "Don't send the password back!"
        const user = await User.findById(req.user.id).select('-password');
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch profile" });
    }
});

// 4. RESET STATS (User requests to reset their own stats)
router.post('/reset-stats', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            'stats.questionsGenerated': 0,
            'stats.tokensUsed': 0
        });
        res.json({ message: "Stats reset successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset stats" });
    }
});
// --- HISTORY ROUTES ---

// 1. Save an item to history
router.post('/save-history', authMiddleware, async (req, res) => {
    try {
        const { tool, title, content } = req.body;
        
        // Find user and push new item to history array
        await User.findByIdAndUpdate(req.user.id, {
            $push: { 
                history: { 
                    tool, 
                    title: title || 'Untitled', 
                    content,
                    createdAt: new Date()
                } 
            }
        });

        res.json({ success: true, message: "Saved to history!" });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ error: "Could not save history" });
    }
});

// 2. Get user's history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('history');
        // Return history sorted by newest first
        const sortedHistory = user.history.sort((a, b) => b.createdAt - a.createdAt);
        res.json(sortedHistory);
    } catch (err) {
        console.error("Fetch History Error:", err);
        res.status(500).json({ error: "Could not fetch history" });
    }
});
module.exports = router;

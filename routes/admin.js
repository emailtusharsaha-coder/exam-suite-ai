const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// 1. GET ALL USERS
// We use BOTH middlewares: First check if logged in, THEN check if Admin
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ date: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// 2. ADD CREDITS (The Magic Button)
router.post('/add-credits', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        // Find user and decrease 'tokensUsed' (Negative usage = More credits)
        // OR better: specific credit field. For now, let's just reset stats or lower usage.
        // Let's implement: "Subtracting from tokensUsed" so they have more room.
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found"});

        // We will simple subtract from 'tokensUsed' to give them space
        // Example: If used 500, and we give 1000 credit, we set used to -500.
        // Simple Logic: just update the stats.
        
        user.stats.tokensUsed -= parseInt(amount);
        // Ensure it doesn't look weird (optional)
        // if (user.stats.tokensUsed < 0) user.stats.tokensUsed = 0; 
        
        await user.save();

        res.json({ message: `Added ${amount} credits successfully!` });
    } catch (err) {
        res.status(500).json({ error: "Failed to add credits" });
    }
});

// 3. DELETE USER
router.delete('/user/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

const Prompt = require('../models/Prompt');

// 4. GET ALL PROMPTS
router.get('/prompts', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const prompts = await Prompt.find();
        res.json(prompts);
    } catch (err) { res.status(500).json({ error: "Failed to fetch prompts" }); }
});

// 5. UPDATE PROMPT
router.put('/prompt/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { template } = req.body;
        await Prompt.findByIdAndUpdate(req.params.id, { template });
        res.json({ message: "Prompt updated!" });
    } catch (err) { res.status(500).json({ error: "Failed to update prompt" }); }
});

module.exports = router;
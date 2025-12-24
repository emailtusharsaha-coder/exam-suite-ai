const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiService'); // Ensure this path is correct
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this path is correct

// --- THE FIX IS HERE (Double Dots) ---
// We try to load 'Prompt' or 'prompt' to be safe against case-sensitivity
let Prompt;
try {
    Prompt = require('../models/Prompt'); // Capital P
} catch (e) {
    Prompt = require('../models/prompt'); // Lowercase p fallback
}

// Same safety for User
let User;
try {
    User = require('../models/User');
} catch (e) {
    User = require('../models/user');
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { question, userAnswer, provider } = req.body;
        
        // Fetch 'descriptive-grader' prompt from DB
        const promptDoc = await Prompt.findOne({ name: 'descriptive-grader' });
        
        // Fallback if prompt is missing in DB
        let systemPrompt = "You are an expert English examiner. Grade the essay.";
        if (promptDoc && promptDoc.template) {
            systemPrompt = promptDoc.template;
        }

        const fullPrompt = `Topic: ${question}\n\nStudent Answer: ${userAnswer}\n\nTask: Grade this out of 10 and provide feedback.`;

        const reply = await callAI({
            provider,
            systemPrompt: systemPrompt,
            userPrompt: fullPrompt,
            temperature: 0.5
        });

        // Track Usage
        if (User) {
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 300 }
            });
        }
        
        res.json({ reply });
    } catch (err) {
        console.error("Descriptive Error:", err);
        res.status(500).json({ error: 'Failed to grade essay.' });
    }
});

module.exports = router;

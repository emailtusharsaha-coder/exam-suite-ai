const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

// Helper to fetch prompt from DB
async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB`);
    return fillTemplate(promptDoc.template, data);
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { sampleQuestion, sampleLogic, provider } = req.body;
        
        // Fetch 'reasoning-gen' prompt from DB
        const userPrompt = await getPrompt('reasoning-gen', { sampleQuestion, sampleLogic });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are an Expert Logical Reasoning Exam Setter.',
            userPrompt,
            temperature: 0.3
        });

        // Track Usage
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 200 }
        });
        
        res.json({ reply });
    } catch (err) {
        console.error("Reasoning Error:", err);
        res.status(500).json({ error: 'Failed to generate reasoning question.' });
    }
});

module.exports = router;
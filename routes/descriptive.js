const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB. Please create it in Admin Panel.`);
    return fillTemplate(promptDoc.template, data);
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { question, userAnswer, provider } = req.body;
        
        // FETCH DYNAMIC PROMPT ('descriptive-gen')
        // Important: You must add this key in your Admin Panel!
        const userPrompt = await getPrompt('descriptive-gen', { question, userAnswer });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are an English Teacher.',
            userPrompt,
            temperature: 0.6
        });

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 250 }
        });
        
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
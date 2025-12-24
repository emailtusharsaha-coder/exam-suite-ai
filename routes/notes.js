const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB`);
    return fillTemplate(promptDoc.template, data);
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { topic, subject, provider } = req.body;
        
        // FETCH DYNAMIC PROMPT ('study-notes')
        const userPrompt = await getPrompt('study-notes', { topic, subject });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are an Expert Exam Tutor.',
            userPrompt,
            temperature: 0.5
        });

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 200 }
        });
        
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate notes.' });
    }
});

module.exports = router;
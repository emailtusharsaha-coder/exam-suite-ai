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
        const { sampleQuestion, sampleSolution, provider } = req.body;
        
        // FETCH DYNAMIC PROMPT ('english-gen')
        const userPrompt = await getPrompt('english-gen', { sampleQuestion, sampleSolution });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are an English Language Expert.',
            userPrompt,
            temperature: 0.6
        });

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 100 }
        });
        
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate English question.' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

// HELPER
async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB`);
    return fillTemplate(promptDoc.template, data);
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { sampleQuestion, sampleSolution, provider } = req.body;
        
        // FETCH DYNAMIC PROMPT ('quant-gen')
        const userPrompt = await getPrompt('quant-gen', { sampleQuestion, sampleSolution });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are a Math Examiner.',
            userPrompt, 
            temperature: 0.1
        });
        
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 150 }
        });

        res.json({ reply });
        
    } catch (err) {
        console.error('Quant Error:', err);
        res.status(500).json({ error: 'Failed to generate question.' });
    }
});

module.exports = router;

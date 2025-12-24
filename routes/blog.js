const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

// Helper to fetch prompt
async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB`);
    return fillTemplate(promptDoc.template, data);
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { topic, keywords, tone, provider } = req.body;
        
        // Fetch 'blog-gen' from DB
        const userPrompt = await getPrompt('blog-gen', { topic, keywords, tone });
        
        const reply = await callAI({
            provider,
            systemPrompt: 'You are a Senior SEO Content Writer.',
            userPrompt,
            temperature: 0.7 // Higher creativity for blogs
        });

        // Blog posts are long and valuable -> Charge 500 tokens
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 500 }
        });
        
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate blog.' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { callAI, fillTemplate } = require('../services/aiService'); // Import Helper
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Prompt = require('../models/Prompt'); // Import Prompt Model

// HELPER: Fetch Prompt from DB and Fill it
async function getPrompt(name, data) {
    const promptDoc = await Prompt.findOne({ name });
    if (!promptDoc) throw new Error(`Prompt '${name}' not found in DB`);
    return fillTemplate(promptDoc.template, data);
}

// 1. QUIZ
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { newsText, questionCount, provider } = req.body;
        
        // FETCH DYNAMIC PROMPT
        const userPrompt = await getPrompt('ga-quiz', { newsText, questionCount });

        const reply = await callAI({
            provider, systemPrompt: 'Current Affairs Quiz Setter',
            userPrompt, temperature: 0.4
        });

        await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 300 } });
        res.json({ reply });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. EXPLAIN NEWS
router.post('/explain', authMiddleware, async (req, res) => {
    try {
        const { newsText, provider } = req.body;
        const userPrompt = await getPrompt('ga-explain', { newsText }); // Fetch from DB

        const reply = await callAI({
            provider, systemPrompt: 'Helpful Tutor',
            userPrompt, temperature: 0.5
        });
        await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 100 } });
        res.json({ reply });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. CIRCULAR
router.post('/circular', authMiddleware, async (req, res) => {
    try {
        const { newsText, provider } = req.body;
        const userPrompt = await getPrompt('ga-circular', { newsText }); // Fetch from DB

        const reply = await callAI({
            provider, systemPrompt: 'Banking Analyst',
            userPrompt, temperature: 0.2
        });
        await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 150 } });
        res.json({ reply });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. CONCEPT
router.post('/concept', authMiddleware, async (req, res) => {
    try {
        const { concept, provider } = req.body;
        const userPrompt = await getPrompt('ga-concept', { concept }); // Fetch from DB

        const reply = await callAI({
            provider, systemPrompt: 'Economics Teacher',
            userPrompt, temperature: 0.6
        });
        await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.questionsGenerated': 1, 'stats.tokensUsed': 50 } });
        res.json({ reply });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
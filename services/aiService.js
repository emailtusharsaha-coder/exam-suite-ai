const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
require('dotenv').config();

// 1. SETUP CLIENTS
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

// 2. UNIVERSAL CALL FUNCTION
async function callAI({ provider, systemPrompt, userPrompt, temperature }) {
    if (!userPrompt || userPrompt.trim() === "") {
        throw new Error("Prompt is empty.");
    }

    try {
        if (provider === 'groq') {
            console.log("🧠 Brain: Groq (Llama 3.3)");
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                temperature: temperature || 0.5,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            });
            return completion.choices[0].message.content;
        } 
        else {
            console.log("🧠 Brain: Gemini 1.5");
            const result = await geminiModel.generateContent(
                systemPrompt + '\n\n' + userPrompt
            );
            return result.response.text();
        }
    } catch (error) {
        console.error("❌ AI Service Error:", error);
        throw error; 
    }
}

// 3. NEW HELPER: Fills in the blanks in the prompt (MISSING PART)
function fillTemplate(template, data) {
    if (!template) return "";
    let filled = template;
    for (const key in data) {
        // Replaces ${key} with the actual value (e.g. ${newsText})
        filled = filled.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), data[key] || "");
    }
    return filled;
}

// IMPORTANT: Export BOTH functions
module.exports = { callAI, fillTemplate };
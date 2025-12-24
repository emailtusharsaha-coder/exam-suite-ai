const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student', enum: ['student', 'admin'] },
    stats: {
        questionsGenerated: { type: Number, default: 0 },
        tokensUsed: { type: Number, default: 0 }
    },
    // --- NEW SECTION: HISTORY ---
    history: [
        {
            tool: { type: String }, // e.g., 'Quants', 'Blog', 'Notes'
            title: { type: String }, // e.g., 'Profit & Loss Question'
            content: { type: String }, // The AI response
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);

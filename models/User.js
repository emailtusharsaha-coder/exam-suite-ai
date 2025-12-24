// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 1. ROLE (Permissions)
    // Options: 'admin', 'quant_faculty', 'english_faculty', 'ga_faculty', 'student'
    role: { 
        type: String, 
        default: 'student', 
        enum: ['admin', 'quant_faculty', 'english_faculty', 'ga_faculty', 'student'] 
    },

    // 2. TRACKING (Cost & Usage)
    stats: {
        tokensUsed: { type: Number, default: 0 },
        questionsGenerated: { type: Number, default: 0 }
    },

    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
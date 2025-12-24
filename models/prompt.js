const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "ga-quiz", "english-grammar"
    template: { type: String, required: true },          // The actual text with ${variables}
    description: { type: String }                        // Note for you (e.g., "Used for GA Quiz generation")
});

module.exports = mongoose.model('Prompt', PromptSchema);
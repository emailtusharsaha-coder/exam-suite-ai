const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await Prompt.create({
        name: "descriptive-gen",
        description: "Grades essays",
        template: "Q: ${question}\nStudent Answer: ${userAnswer}\nTask: Grade out of 10 and give feedback on structure/content."
    });
    console.log("Added Descriptive Prompt!");
    process.exit();
});

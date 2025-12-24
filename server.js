const adminRoutes = require('./routes/admin');
const express = require('express');
const blogRoutes = require('./routes/blog');
const cors = require('cors');
const notesRoutes = require('./routes/notes');
const mongoose = require('mongoose'); // <--- Added this last time
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!process.env.GEMINI_API_KEY || !process.env.GROQ_API_KEY || !process.env.MONGO_URI) {
    console.error("❌ ERROR: Missing Keys in .env file");
    process.exit(1);
}

// ROUTE IMPORTS
const quantRoutes = require('./routes/quants');
const englishRoutes = require('./routes/english');
const gaRoutes = require('./routes/ga');
const descriptiveRoutes = require('./routes/descriptive');
const authRoutes = require('./routes/auth'); // <--- NEW

// USE ROUTES
app.use('/generate-quant', quantRoutes);
app.use('/generate-english', englishRoutes);
app.use('/generate-ga', gaRoutes);
app.use('/check-descriptive', descriptiveRoutes);
app.use('/api/auth', authRoutes); // <--- NEW
app.use('/generate-notes', notesRoutes);
app.use('/generate-blog', blogRoutes);
app.use('/api/admin', adminRoutes);

// CONNECT DB & START
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Database Connected (MongoDB Atlas)");
        app.listen(port, () => {
            console.log(`✅ Modular Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => console.error("❌ Database Error:", err));
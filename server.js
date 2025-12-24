const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // <--- CRITICAL IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(express.json());
app.use(cors());

// SERVE STATIC FILES (CSS, HTML, JS)
// This tells the server to look in the 'public' folder for files
app.use(express.static(path.join(__dirname, 'public')));

// CONNECT TO DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected (MongoDB Atlas)"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// IMPORT ROUTES
const authRoutes = require('./routes/auth');
const quantRoutes = require('./routes/quants');
const englishRoutes = require('./routes/english');
const reasoningRoutes = require('./routes/reasoning');
const gaRoutes = require('./routes/ga'); // Ensure this file exists
const notesRoutes = require('./routes/notes');
const blogRoutes = require('./routes/blog'); // Ensure this file exists
const descriptiveRoutes = require('./routes/descriptive'); // Ensure this file exists
const adminRoutes = require('./routes/admin');

// USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/generate-quants', quantRoutes);
app.use('/generate-english', englishRoutes);
app.use('/generate-reasoning', reasoningRoutes);
app.use('/generate-ga', gaRoutes);
app.use('/generate-notes', notesRoutes);
app.use('/generate-blog', blogRoutes);
app.use('/generate-descriptive', descriptiveRoutes);

// --- THE FIX: HANDLE HOMEPAGE & REFRESHES ---
// This forces the server to serve 'index.html' when you visit the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// START SERVER
app.listen(PORT, () => {
    console.log(`✅ Modular Server running at http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// --- THE FIX: USE 'Public' (Capital P) TO MATCH YOUR FOLDER ---
const publicPath = path.join(__dirname, 'Public'); 
console.log("📂 Server is looking for files in:", publicPath);

if (fs.existsSync(publicPath)) {
    console.log("✅ Public folder found!");
} else {
    console.log("❌ Public folder MISSING at path:", publicPath);
}

// Serve static files from 'Public'
app.use(express.static(publicPath));

// CONNECT TO DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// ROUTES
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const quantRoutes = require('./routes/quants'); // Ensure filename is quants.js (lowercase)
const englishRoutes = require('./routes/english');
const reasoningRoutes = require('./routes/reasoning');
const gaRoutes = require('./routes/ga');
const notesRoutes = require('./routes/notes');
const blogRoutes = require('./routes/blog');
const descriptiveRoutes = require('./routes/addDescriptive'); // Ensure filename matches

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/generate-quants', quantRoutes);
app.use('/generate-english', englishRoutes);
app.use('/generate-reasoning', reasoningRoutes);
app.use('/generate-ga', gaRoutes);
app.use('/generate-notes', notesRoutes);
app.use('/generate-blog', blogRoutes);
app.use('/generate-descriptive', descriptiveRoutes);

// FORCE HOMEPAGE
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`Error: index.html not found in ${publicPath}`);
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

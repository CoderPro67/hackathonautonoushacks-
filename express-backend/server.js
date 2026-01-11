const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large payloads for file content if needed

// Routes
const auditController = require('./controllers/auditController');
const pdfController = require('./controllers/pdfController');
const extractionController = require('./controllers/extractionController');

app.post('/audit-and-verify', auditController.auditAndVerify);
app.post('/generate-pdf', pdfController.generatePDF);
app.post('/extract-data', extractionController.extractData);

app.get('/', (req, res) => {
    res.send('BRSR Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

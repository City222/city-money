const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Enable explicit CORS for all incoming requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const LEADS_FILE = path.join(__dirname, 'leads.json');

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route aligned with business.js (/api/contacts)
app.post('/api/contacts', async (req, res) => {
    const { name, email, details } = req.body;

    try {
        // 1. Save lead to leads.json
        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
            const fileData = fs.readFileSync(LEADS_FILE, 'utf8');
            leads = fileData ? JSON.parse(fileData) : [];
        }
        leads.push({ name, email, details, date: new Date().toISOString() });
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

        // 2. Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Project Request from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nProject Details: ${details}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, message: 'Server error processing request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const LEADS_FILE = path.join(__dirname, 'leads.json');

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, details } = req.body;

  if (!name || !email || !details) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // 1. Save locally to leads.json
    let leads = [];
    if (fs.existsSync(LEADS_FILE)) {
      const fileData = fs.readFileSync(LEADS_FILE, 'utf8');
      leads = fileData ? JSON.parse(fileData) : [];
    }

    const newLead = { id: Date.now(), name, email, details, date: new Date().toLocaleString() };
    leads.push(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

    // 2. Send Email Alert
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Lead: ${name}`,
        text: `You received a new message from ${name} (${email}):\n\n"${details}"`
      });
      console.log(`[EMAIL SENT] Alert delivered to inbox for ${name}`);
    }

    return res.status(200).json({ success: true, message: 'Thank you! Your message has been received.' });
  } catch (error) {
    console.error('Error processing lead:', error);
    return res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
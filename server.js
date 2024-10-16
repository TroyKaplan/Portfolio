// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

// Use environment variables for sensitive data
require('dotenv').config();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.post('/run-code', async (req, res) => {
    const { code } = req.body;

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', {
            script: code,
            language: 'cpp',
            versionIndex: '0',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        });
        res.json({ output: response.data.output });
    } catch (error) {
        res.status(500).json({ output: 'Error executing code. Server Not Enabled.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

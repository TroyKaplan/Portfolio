const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(express.json());

// Update CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seahorse-app-thp9i.ondigitalocean.app', 'https://www.troykaplan.dev'] 
    : 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

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
        res.status(500).json({ output: 'Error executing code. JDoodle Server Not Enabled.' });
    }
});

// Add new endpoint for game status
app.get('/api/game-status', async (req, res) => {
  try {
    let response;
    // Try HTTPS first
    try {
      response = await axios.get('https://status.troykaplan.dev:4351/status', {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 1500 // 1.5 second timeout  MAKE LONGER WHEN YOU HAVE CERTS
      });
    } catch (httpsError) {
      // Fall back to HTTP
      response = await axios.get('http://64.23.147.242:4350/status', {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 15000 // 15 second timeout
      });
    }

    // Validate that we received JSON
    if (typeof response?.data !== 'object') {
      throw new Error('Invalid response format');
    }

    res.json(response.data);
  } catch (error) {
    // Don't change status on timeout, return last known state
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      res.json({ 
        wolfscape: true, 
        rocketGame: true,
        warning: 'Slow response, using last known state' 
      });
    } else {
      console.error('Game status check failed:', error.message);
      res.json({ 
        wolfscape: false, 
        rocketGame: false,
        error: 'Server temporarily unavailable' 
      });
    }
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
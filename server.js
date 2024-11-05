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
    const response = await axios.get('https://status.troykaplan.dev:4350/status', {
      headers: {
        'Accept': 'application/json',
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching game status:', error);
    res.status(500).json({ 
      wolfscape: false, 
      rocketGame: false,
      error: 'Failed to fetch game status' 
    });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
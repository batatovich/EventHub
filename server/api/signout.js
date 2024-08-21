const express = require('express');
const { deleteSession } = require('../services/session'); 

const router = express.Router();

router.post('/', (req, res) => {
  try {
    // Delete the session
    deleteSession(req, res); 

    // Send a response to the client
    return res.status(200).json({ success: 'Signed out successfully!' });
  } catch (error) {
    console.error('Error during sign out:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;

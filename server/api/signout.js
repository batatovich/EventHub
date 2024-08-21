const express = require('express');
const { deleteSession } = require('../services/session');

const createSignOutRoute = () => {
  const router = express.Router();

  router.post('/', (req, res) => {
    try {
      deleteSession(req, res);

      return res.status(200).json({ success: 'Signed out successfully!' });
    } catch (error) {
      console.error('Error during sign out:', error);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });

  return router;
};

module.exports = createSignOutRoute;

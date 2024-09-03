const express = require('express');
const { deleteSession } = require('../services/session');

const createSignOutRoute = (rollbar) => {
  const router = express.Router();

  router.post('/', (req, res) => {
    try {
      deleteSession(req, res);
      return res.status(200).json({
        status: 'success',
        data: { message: 'Signed out successfully!' }
      });
    } catch (error) {
      rollbar.error('Error during sign out:', error);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred.',
        data: { error: error.message }
      });
    }
  });

  return router;
};

module.exports = createSignOutRoute;

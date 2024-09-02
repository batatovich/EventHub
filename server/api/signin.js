const express = require('express');
const bcrypt = require('bcrypt');
const { createSession } = require('../services/session');

const createSignInRoute = (prisma) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      await createSession(req, res, user.id);

      return res.status(200).json({ success: 'Signed in successfully!' });
    } catch (error) {
      console.error('Error during sign in:', error);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });

  return router;
};

module.exports = createSignInRoute;

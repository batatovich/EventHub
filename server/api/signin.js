const bcrypt = require('bcrypt');
const express = require('express');
const { createSession } = require('../services/session');
const { body, validationResult } = require('express-validator');

const createSignInRoute = (prisma, rollbar) => {
  const router = express.Router();

  router.post(
    '/',
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),

      body('password')
        .isLength({ min: 8 })
        .withMessage('Password is required')
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join('\n');
        return res.status(400).json({
          status: 'fail',
          data: { message: errorMessages }
        });
      }
      const { email, password } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return res.status(401).json({
            status: 'fail',
            data: { message: 'Invalid credentials.' }
          });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(401).json({
            status: 'fail',
            data: { message: 'Invalid credentials.' }
          });
        }

        await createSession(req, res, user.id);

        return res.status(200).json({
          status: 'success',
          data: { message: 'Signed in successfully!' }
        });
      } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError) {
          const errorCode = parseInt(error.code.substring(1), 10); 
          if (errorCode >= 1000 && errorCode < 2000) {
            // Handle Prisma 1xxx errors (system issues)
            return res.status(500).json({
              status: 'error',
              message: 'Database connection error.',
              data: { error: error.message }
            });
          } else if (errorCode >= 2000 && errorCode < 3000) {
            // Handle Prisma 2xxx errors (unlikely in sign-in but included for completeness)
            return res.status(400).json({
              status: 'fail',
              data: { message: `Database validation error: ${error.message}` }
            });
          }
        }
        rollbar.error('Error during sign in:', error);
        return res.status(500).json({
          status: 'error',
          message: 'An unexpected error occurred.',
          data: { error: error.message }
        });
      }
    }
  );

  return router;
};

module.exports = createSignInRoute;

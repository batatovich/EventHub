const bcrypt = require('bcrypt');
const express = require('express');
const { body, validationResult } = require('express-validator');

const createSignUpRoute = (prisma, rollbar) => {
  const router = express.Router();

  router.post(
    '/',
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&#]/)
        .withMessage('Password must contain at least one special character: @$!%*?&#'),
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match');
          }
          return true;
        })
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
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(409).json({
            status: 'fail',
            data: { message: 'Email already registered.' }
          });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        await prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
          },
        });

        return res.status(201).json({
          status: 'success',
          data: { message: 'User registered successfully!' }
        });
      } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            return res.status(409).json({
              status: 'fail',
              data: { message: 'This email is already registered. Please use another email.' }
            });
          }

          // Distinguish between other Prisma 2xxx and 1xxx errors
          const errorCode = parseInt(error.code.substring(1), 10); 
          if (errorCode >= 2000 && errorCode < 3000) {
            // Handle other Prisma 2xxx errors (data issues)
            return res.status(400).json({
              status: 'fail',
              data: { message: `Database validation error: ${error.message}` }
            });
          } else if (errorCode >= 1000 && errorCode < 2000) {
            // Handle Prisma 1xxx errors (system errors)
            return res.status(500).json({
              status: 'error',
              message: 'Database connection error.',
              data: { error: error.message }
            });
          }
        }
        rollbar.error('Error during sign up:', error);
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

module.exports = createSignUpRoute;

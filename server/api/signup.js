const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prisma-client');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
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

        // Return a success response
        return res.status(201).json({ success: 'User registered successfully!' });
    } catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

module.exports = router;

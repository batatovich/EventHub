const express = require('express');
const { decrypt } = require('../services/session');

const createValidateSessionRoute = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        try {
            const sessionCookie = req.cookies.session;
            if (!sessionCookie) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const session = await decrypt(sessionCookie);

            if (!session?.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Session is valid
            return res.status(200).json({ valid: true, userId: session.userId });
        } catch (error) {
            console.error('Error validating session:', error);
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    });

    return router;
};

module.exports = createValidateSessionRoute;

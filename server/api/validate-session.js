const express = require('express');
const { decrypt } = require('../services/session');

const createValidateSessionRoute = (rollbar) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        try {
            const sessionCookie = req.cookies.session;
            if (!sessionCookie) {
                return res.status(401).json({
                    status: 'fail',
                    data: { message: 'Unauthorized' }
                });
            }

            const session = await decrypt(sessionCookie);

            if (!session?.userId) {
                return res.status(401).json({
                    status: 'fail',
                    data: { message: 'Unauthorized' }
                });
            }

            // Session is valid
            return res.status(200).json({
                status: 'success',
                data: { valid: true, userId: session.userId }
            });
        } catch (error) {
            rollbar.error('Error validating session:', error);
            return res.status(500).json({
                status: 'error',
                message: 'An unexpected error occurred.',
                data: { error: error.message }
            });
        }
    });

    return router;
};

module.exports = createValidateSessionRoute;

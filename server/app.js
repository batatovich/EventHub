const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authenticate = require('./services/authMiddleware');
const signinRoute = require('./api/signin');
const signupRoute = require('./api/signup');
const signoutRoute = require('./api/signout');

let app;

function createApp() {
    if (!app) {
        app = express();

        // Middleware
        const CLIENT_PORT = 3000;
        const corsOptions = {
            origin: [
                `http://127.0.0.1:${CLIENT_PORT}`,
                `http://localhost:${CLIENT_PORT}`,
                'https://your-app.vercel.app',      // Replace with Vercel domain
            ],
        };
        app.use(cors(corsOptions));
        app.use(express.json());
        app.use(cookieParser()); 
        app.use(authenticate);

        // Routes
        app.use('/api/auth/signup', signupRoute);
        app.use('/api/auth/signin', signinRoute);
        app.use('/api/auth/signout', signoutRoute); 
    }
    return app;
}

module.exports = createApp;

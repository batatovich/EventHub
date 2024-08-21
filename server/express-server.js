const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authenticate = require('./services/authMiddleware');
const createApolloServer = require('./apollo-server');
const { expressMiddleware } = require('@apollo/server/express4'); 
const signinRoute = require('./api/signin');
const signupRoute = require('./api/signup');
const signoutRoute = require('./api/signout');

let app;

async function setupServer() {
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
        //app.use(authenticate);

        // Apollo Server setup
        const apolloServer = await createApolloServer();
        app.use('/graphql', expressMiddleware(apolloServer)); 

        // Routes
        app.use('/api/auth/signup', signupRoute);
        app.use('/api/auth/signin', signinRoute);
        app.use('/api/auth/signout', signoutRoute); 


    }
    return app;
}

module.exports = setupServer;

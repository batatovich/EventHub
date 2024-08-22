const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { expressMiddleware } = require('@apollo/server/express4'); 
const config = require('./config');
const createSignInRoute = require('./api/signin');
const createSignUpRoute = require('./api/signup');
const createSignOutRoute = require('./api/signout');
const createValidateSessionRoute = require('./api/validate-session');


async function setupServer({ prisma, authenticate, createApolloServer }) {
    const app = express();

    // Middleware
    app.use(cors(config.CORS_OPTIONS));
    app.use(express.json());
    app.use(cookieParser()); 

    // Authentication middleware 
    if (authenticate) {
       app.use(authenticate);
    }

    // Apollo Server 
    if (createApolloServer) {
        const apolloServer = await createApolloServer();
        app.use('/api/graphql', expressMiddleware(apolloServer));
    }

    // Authentication routes
    app.use('/api/auth/signup',createSignUpRoute(prisma));
    app.use('/api/auth/signin', createSignInRoute(prisma));
    app.use('/api/auth/signout', createSignOutRoute()); 
    app.use('/api/auth/validate-session', createValidateSessionRoute()); 

    return app;
}

module.exports = setupServer;

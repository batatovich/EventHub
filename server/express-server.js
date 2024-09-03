const cors = require('cors');
const config = require('./config');
const express = require('express');
const Rollbar = require('rollbar');
const cookieParser = require('cookie-parser');
const createSignInRoute = require('./api/signin');
const createSignUpRoute = require('./api/signup');
const createSignOutRoute = require('./api/signout');
const createValidateSessionRoute = require('./api/validate-session');
const { expressMiddleware } = require('@apollo/server/express4');
const { getUserIdFromSession } = require('./services/session');

async function setupServer({ prisma, authMiddleware, createApolloServer }) {
    const app = express();

    const rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
      })
      
    // Middleware
    app.use(cors(config.CORS_OPTIONS));
    app.use(express.json());
    app.use(cookieParser());
    app.use(rollbar.errorHandler());

    // Authentication middleware 
    if (authMiddleware) {
        app.use(authMiddleware);
    }

    // Apollo Server 
    if (createApolloServer) {
        const apolloServer = await createApolloServer({ rollbar });
        app.use(
            '/api/graphql',
            expressMiddleware(apolloServer, {
                context: async ({ req }) => {
                    const userId = await getUserIdFromSession(req);
                    return { userId, prisma };
                },
            })
        );
    }

    // Authentication routes
    app.use('/api/auth/signup', createSignUpRoute(prisma, rollbar));
    app.use('/api/auth/signin', createSignInRoute(prisma, rollbar));
    app.use('/api/auth/signout', createSignOutRoute(rollbar));
    app.use('/api/auth/validate-session', createValidateSessionRoute(rollbar));

    return app;
}

module.exports = setupServer;

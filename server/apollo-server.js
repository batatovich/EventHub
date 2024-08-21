const { ApolloServer } = require('@apollo/server');
const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolvers');
const { getUserIdFromSession } = require('./services/session');

async function createApolloServer() {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const userId = await getUserIdFromSession(req);
            return { userId };
        },
    });

    await apolloServer.start();
    return apolloServer;
}

module.exports = createApolloServer;

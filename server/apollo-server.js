const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolvers');
const { ApolloServer } = require('@apollo/server');

async function createApolloServer({ rollbar }) {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (err) => {
            rollbar.error(err);

            return {
                message: err.message,
                locations: err.locations,
                path: err.path,
                extensions: err.extensions,
            };
        },
    });

    await apolloServer.start();
    return apolloServer;
}

module.exports = createApolloServer;

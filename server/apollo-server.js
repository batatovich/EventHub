const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolvers');
const { ApolloServer } = require('@apollo/server');

async function createApolloServer() {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await apolloServer.start();
    return apolloServer;
}

module.exports = createApolloServer;

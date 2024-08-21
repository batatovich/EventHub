
const resolvers = {
  Query: {
    me: async () => {
      // Bypass authentication check for testing
      return {
        id: '123',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      };
    },
  },
};

module.exports = resolvers;

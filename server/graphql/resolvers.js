const resolvers = {
  Query: {
    myEvents: async (_, __, context) => {

      const { userId } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }
      return await prisma.event.findMany({
        where: { creatorId: userId },
      });
    },
  },
};

module.exports = resolvers;
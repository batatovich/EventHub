const resolvers = {
  Event: {
    attendance: async (parent, __, context) => {
      const { prisma } = context;
      const acceptedCount = await prisma.application.count({
        where: {
          eventId: parent.id,
          status: 'ACCEPTED',
        },
      });
      return acceptedCount;
    },
  },
  Query: {
    myEvents: async (_, __, context) => {

      const { userId, prisma } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }
      return await prisma.event.findMany({
        where: { creatorId: userId },
      });
    },
    othersEvents: async (_, __, context) => {
      const { userId, prisma } = context;

      if (!userId) {
        throw new Error('Unauthorized');
      }

      const events = await prisma.event.findMany({
        where: { creatorId: { not: userId } },
        include: {
          applications: {
            where: { userId },
            select: { status: true },
          },
        },
      });

      return events.map(event => ({
        ...event,
        applicationStatus: event.applications.length > 0 ? event.applications : null,
      }));
    },
    eventApplications: async (_, { eventId }, context) => {
      const { userId, prisma } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          applications: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!event || event.creatorId !== userId) {
        throw new Error('You do not have permission to view applications for this event.');
      }

      return event.applications;
    },
  },
  Mutation: {
    createEvent: async (_, { name, description, location, date, capacity, fee }, context) => {
      const { userId, prisma } = context;

      if (!userId) {
        throw new Error('Unauthorized');
      }

      return await prisma.event.create({
        data: {
          name,
          description,
          location,
          date: date,
          capacity: parseInt(capacity, 10),
          fee: parseFloat(fee),
          creatorId: userId,
        },
      });
    },
    deleteEvent: async (_, { id }, context) => {
      const { userId, prisma } = context;

      if (!userId) {
        throw new Error('Unauthorized');
      }

      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event || event.creatorId !== userId) {
        throw new Error('There was a problem deleting the event.');
      }

      await prisma.event.delete({
        where: { id },
      });

      return true;
    },
    applyToEvent: async (_, { eventId }, context) => {
      const { userId, prisma } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const existingApplication = await prisma.application.findFirst({
        where: {
          AND: [
            { userId: userId },
            { eventId: eventId }
          ]
        },
      });

      // Handle existing application logic
      if (existingApplication) {
        if (existingApplication.status === 'PENDING' || existingApplication.status === 'ACCEPTED') {
          throw new Error('You already have an active application for this event.');
        } else if (existingApplication.status === 'REJECTED') {
          // Allow reapplication by updating the existing application
          return await prisma.application.update({
            where: { id: existingApplication.id },
            data: { status: 'PENDING' },
          });
        }
      }

      // If no application exists, create a new one
      return await prisma.application.create({
        data: {
          status: 'PENDING',
          event: { connect: { id: eventId } },
          user: { connect: { id: userId } },
        },
      });
    },
    cancelApplication: async (_, { eventId }, context) => {
      const { userId, prisma } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const deleted = await prisma.application.deleteMany({
        where: {
          eventId,
          userId,
        },
      });

      // Return true if any records were deleted, otherwise false
      return deleted.count > 0;
    },
    updateApplicationStatus: async (_, { id, status }, context) => {
      const { userId, prisma } = context;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      // Find the application and check if the event belongs to the current user
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          event: true,
        },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.event.creatorId !== userId) {
        throw new Error('You do not have permission to update this application.');
      }

      // Update the status of the application
      await prisma.application.update({
        where: { id },
        data: { status },
      });

      return true;
    },
  },
};

module.exports = resolvers;
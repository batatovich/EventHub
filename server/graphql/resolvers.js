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

      // Fetch the event to check current attendance and timestamp
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          applications: {
            where: { status: 'ACCEPTED' },
          },
        },
      });

      const acceptedCount = event.applications.length;

      if (acceptedCount >= event.capacity) {
        throw new Error('Event is fully booked.');
      }

      // Check if the user has somehow already applied to prevent duplication
      const existingApplication = await prisma.application.findFirst({
        where: {
          AND: [
            { userId: userId },
            { eventId: eventId }
          ]
        },
      });

      // Handle existing application logic
      if (existingApplication && existingApplication.status !== 'REJECTED') {
        throw new Error('You already have an active application for this event.');
      }

      // Perform OCC by updating event timestamp
      const updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
          updatedAt: event.updatedAt,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      if (!updatedEvent) {
        throw new Error('Concurrency conflict: The event has been modified by another process.');
      }

      if (existingApplication) {
        return await prisma.application.update({
          where: { id: existingApplication.id },
          data: {
            status: 'PENDING'
          },
        });

      } else {
        return await prisma.application.create({
          data: {
            event: { connect: { id: eventId } },
            user: { connect: { id: userId } },
            status: 'PENDING',
          },
        });
      }
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

      // Find the application and check if the event belongs to the current user
      const application = await prisma.application.findUnique({
        where: {
          id,
          event: {
            creatorId: userId,
          },
        },
        include: {
          event: true,
        },
      });

      if (!application) {
        throw new Error('Application not found or insufficient permissions.');
      }

      // If the status is REJECTED, just update the application and return early
      if (status === 'REJECTED') {
        await prisma.application.update({
          where: { id },
          data: { status },
        });
        return true;
      }

      // If status is ACCEPTED, perform capacity and concurrency checks
      if (status === 'ACCEPTED') {
        // Check if there's capacity
        const acceptedCount = await prisma.application.count({
          where: {
            eventId: application.eventId,
            status: 'ACCEPTED',
          },
        });

        if (acceptedCount >= application.event.capacity) {
          // Automatically reject the application
          await prisma.application.update({
            where: { id },
            data: { status: 'REJECTED' },
          });
          throw new Error('Cannot accept application: Event capacity reached.');
        }

        // Check timestamp before updating to prevent concurrency issues
        const updatedEvent = await prisma.event.update({
          where: {
            id: application.eventId,
            updatedAt: application.event.updatedAt,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        if (!updatedEvent) {
          throw new Error('Concurrency conflict: The event has been modified by another process.');
        }
      }

      // Update the status of the application to the desired status
      await prisma.application.update({
        where: { id },
        data: { status },
      });

      return true;
    },
  },
};

module.exports = resolvers;
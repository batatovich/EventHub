const { GraphQLError } = require('graphql');
const { CreateEventSchema } = require('./validation-schemas');
const { handlePrismaErrors } = require('./prismaErrorHandler');

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

      try {
        return await prisma.event.findMany({
          where: { creatorId: userId },
          orderBy: {
            date: 'asc',
          },
        });
      } catch (error) {
        handlePrismaErrors(error);
      }
    },
    othersEvents: async (_, __, context) => {
      const { userId, prisma } = context;

      try {
        const events = await prisma.event.findMany({
          where: { creatorId: { not: userId } },
          include: {
            applications: {
              where: { userId },
              select: { status: true },
            },
          },
          orderBy: {
            date: 'asc',
          },
        });

        return events.map(event => ({
          ...event,
          applicationStatus: event.applications.length > 0 ? event.applications : null,
        }));
      } catch (error) {
        handlePrismaErrors(error);
      }
    },
    eventApplications: async (_, { eventId }, context) => {
      const { userId, prisma } = context;

      try {
        if (!eventId) {
          throw new GraphQLError('Event ID is required', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
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

        if (!event) {
          throw new GraphQLError('Event not found', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }

        if (event.creatorId !== userId) {
          throw new GraphQLError('You do not have permission to view applications for this event', {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
        }

        return event.applications;

      } catch (error) {
        handlePrismaErrors(error);
      }
    },
  },
  Mutation: {
    createEvent: async (_, { name, description, location, date, capacity, fee }, context) => {
      const { userId, prisma } = context;


      try {
        await CreateEventSchema.validate({ name, description, location, date, capacity, fee }, { abortEarly: false });

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

      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError('Validation failed', {
            extensions: {
              validationErrors: error.inner.map(err => ({
                path: err.path,
                message: err.message
              })),
              code: 'BAD_USER_INPUT',
            },
          });
        }

        handlePrismaErrors(error);
      }
    },
    deleteEvent: async (_, { id }, context) => {
      const { userId, prisma } = context;

      try {
        if (!id) {
          throw new GraphQLError('Event ID is required.', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const event = await prisma.event.findUnique({
          where: { id },
        });

        if (!event) {
          throw new GraphQLError('Event not found.', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }

        if (event.creatorId !== userId) {
          throw new GraphQLError('You do not have permission to delete this event.', {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
        }

        await prisma.event.delete({
          where: { id },
        });

        return true;

      } catch (error) {
        handlePrismaErrors(error);  // Handle any Prisma-specific or unexpected errors
      }
    },

    applyToEvent: async (_, { eventId }, context) => {
      const { userId, prisma } = context;

      try {
        if (!eventId) {
          throw new GraphQLError('Event ID is required.', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        const event = await prisma.event.findUnique({
          where: { id: eventId },
          include: {
            applications: {
              where: { status: 'ACCEPTED' },
            },
          },
        });

        if (!event) {
          throw new GraphQLError('Event not found.', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }

        const acceptedCount = event.applications.length;

        // Check if the event is fully booked
        if (acceptedCount >= event.capacity) {
          throw new GraphQLError('Event is fully booked.', {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
        }

        // Check if the user has already applied (and status is not 'REJECTED')
        const existingApplication = await prisma.application.findFirst({
          where: {
            AND: [
              { userId: userId },
              { eventId: eventId },
            ],
          },
        });

        if (existingApplication && existingApplication.status !== 'REJECTED') {
          throw new GraphQLError('You already have an active application for this event.', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }

        // Perform OCC (Optimistic Concurrency Control)
        const previousUpdatedAt = event.updatedAt;
        const updateResult = await prisma.event.updateMany({
          where: {
            id: eventId,
            updatedAt: previousUpdatedAt,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new GraphQLError('Concurrency conflict: The event has been modified by another process.', {
            extensions: {
              code: 'OCC_CONFLICT',
            },
          });
        }

        // Update the existing application if found
        if (existingApplication) {
          return await prisma.application.update({
            where: { id: existingApplication.id },
            data: {
              status: 'PENDING',
            },
          });
        }

        // Create a new application
        return await prisma.application.create({
          data: {
            event: { connect: { id: eventId } },
            user: { connect: { id: userId } },
            status: 'PENDING',
          },
        });

      } catch (error) {
        handlePrismaErrors(error);  // Handle any Prisma-specific or unexpected errors
      }
    },
    cancelApplication: async (_, { eventId }, context) => {
      const { userId, prisma } = context;

      try {
        const deleted = await prisma.application.deleteMany({
          where: {
            eventId,
            userId,
          },
        });

        // Return an error if no application was found to cancel
        if (deleted.count === 0) {
          throw new GraphQLError('No application found to cancel.', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }

        return true;

      } catch (error) {
        handlePrismaErrors(error);  // Handle any Prisma-specific or unexpected errors
      }
    },

    updateApplicationStatus: async (_, { id, status }, context) => {
      const { userId, prisma } = context;

      try {
        // Find the application and check if the event belongs to the current user
        const application = await prisma.application.findUnique({
          where: { id },
          include: {
            event: true,
          },
        });

        if (!application || application.event.creatorId !== userId) {
          throw new GraphQLError('Application not found or insufficient permissions.', {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
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
            throw new GraphQLError('Cannot accept application: Event capacity reached.', {
              extensions: {
                code: 'FORBIDDEN',
              },
            });
          }

          // OCC (Optimistic Concurrency Control)
          const previousUpdatedAt = application.event.updatedAt;
          const updatedEvent = await prisma.event.updateMany({
            where: {
              id: application.eventId,
              updatedAt: previousUpdatedAt,
            },
            data: {
              updatedAt: new Date(),
            },
          });

          if (updatedEvent.count === 0) {
            throw new GraphQLError('Concurrency conflict: The event has been modified by another process.', {
              extensions: {
                code: 'OCC_CONFLICT',
              },
            });
          }
        }

        // Update the status of the application
        await prisma.application.update({
          where: { id },
          data: { status },
        });

        return true;

      } catch (error) {
        handlePrismaErrors(error);  // Handle any Prisma-specific or unexpected errors
      }
    },
  },
};

module.exports = resolvers;
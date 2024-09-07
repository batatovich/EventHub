const { Mutation } = require('../graphql/resolvers');
const { applyToEvent } = Mutation;
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');
const { GraphQLError } = require('graphql');

// Mock Prisma
const prismaMock = {
  event: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  application: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const context = {
  userId: 'test-user-id',
  prisma: prismaMock,
};

// Mock the error handler
jest.mock('../graphql/prismaErrorHandler', () => ({
  handlePrismaErrors: jest.fn(),
}));

describe('applyToEvent resolver', () => {
  it('should apply to the event successfully', async () => {
    const mockEvent = {
      id: '1',
      capacity: 100,
      updatedAt: new Date(),
      applications: [],
    };
    prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);
    prismaMock.event.updateMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.application.create.mockResolvedValueOnce({ id: 'app1', status: 'PENDING' });

    const result = await applyToEvent(null, { eventId: '1' }, context);

    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        applications: {
          where: { status: 'ACCEPTED' },
        },
      },
    });

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: {
        id: '1',
        updatedAt: mockEvent.updatedAt,
      },
      data: {
        updatedAt: expect.any(Date),
      },
    });

    expect(prismaMock.application.create).toHaveBeenCalledWith({
      data: {
        event: { connect: { id: '1' } },
        user: { connect: { id: 'test-user-id' } },
        status: 'PENDING',
      },
    });

    expect(result).toEqual({ id: 'app1', status: 'PENDING' });
  });

  it('should throw an error if event ID is not provided', async () => {
    try {
      await applyToEvent(null, { eventId: null }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Event ID is required.');
      expect(error.extensions.code).toBe('BAD_USER_INPUT');
    }
  });

  it('should throw an error if event is not found', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce(null);

    try {
      await applyToEvent(null, { eventId: '1' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Event not found.');
      expect(error.extensions.code).toBe('NOT_FOUND');
    }
  });

  it('should throw an error if event is fully booked', async () => {
    const mockEvent = {
      id: '1',
      capacity: 100,
      applications: new Array(100).fill({ status: 'ACCEPTED' }),
    };
    prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);

    try {
      await applyToEvent(null, { eventId: '1' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Event is fully booked.');
      expect(error.extensions.code).toBe('FORBIDDEN');
    }
  });

  it('should throw an error if user has already applied', async () => {
    const mockEvent = {
      id: '1',
      capacity: 100,
      applications: [],
    };
    prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: 'app1', status: 'PENDING' });

    try {
      await applyToEvent(null, { eventId: '1' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('You already have an active application for this event.');
      expect(error.extensions.code).toBe('BAD_USER_INPUT');
    }
  });

  it('should handle concurrency conflicts (OCC)', async () => {
    const mockEvent = {
      id: '1',
      capacity: 100,
      updatedAt: new Date(),
      applications: [],
    };
    prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);
    prismaMock.event.updateMany.mockResolvedValueOnce({ count: 0 }); // Simulate concurrency conflict

    try {
      await applyToEvent(null, { eventId: '1' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Concurrency conflict: The event has been modified by another process.');
      expect(error.extensions.code).toBe('OCC_CONFLICT');
    }
  });

  it('should handle Prisma errors', async () => {
    const prismaError = new Error('Prisma error');
    prismaMock.event.findUnique.mockRejectedValueOnce(prismaError);

    try {
      await applyToEvent(null, { eventId: '1' }, context);
    } catch {
      expect(handlePrismaErrors).toHaveBeenCalledWith(prismaError);
    }
  });
});

const { Mutation } = require('../graphql/resolvers');
const { updateApplicationStatus } = Mutation;
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');
const { GraphQLError } = require('graphql');

// Mock Prisma
const prismaMock = {
  application: {
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  event: {
    updateMany: jest.fn(),
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

describe('updateApplicationStatus resolver', () => {
  it('should update the application status successfully', async () => {
    const mockApplication = {
      id: '1',
      status: 'PENDING',
      event: {
        id: '1',
        creatorId: 'test-user-id',
        updatedAt: new Date('2024-10-01T00:00:00Z'),
        capacity: 10,
      },
    };

    prismaMock.application.findUnique.mockResolvedValueOnce(mockApplication);
    prismaMock.application.count.mockResolvedValueOnce(5); // Less than capacity
    prismaMock.event.updateMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.application.update.mockResolvedValueOnce(true);

    const result = await updateApplicationStatus(null, { id: '1', status: 'ACCEPTED' }, context);

    expect(prismaMock.application.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { event: true },
    });
    expect(prismaMock.application.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: 'ACCEPTED' },
    });
    expect(result).toBe(true);
  });

  it('should throw a forbidden error when the user does not own the event', async () => {
    const mockApplication = {
      id: '1',
      status: 'PENDING',
      event: {
        id: '1',
        creatorId: 'other-user-id',
      },
    };

    prismaMock.application.findUnique.mockResolvedValueOnce(mockApplication);

    try {
      await updateApplicationStatus(null, { id: '1', status: 'ACCEPTED' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Application not found or insufficient permissions.');
      expect(error.extensions.code).toBe('FORBIDDEN');
    }
  });

  it('should throw a forbidden error when event capacity is reached', async () => {
    const mockApplication = {
      id: '1',
      status: 'PENDING',
      event: {
        id: '1',
        creatorId: 'test-user-id',
        capacity: 5,
      },
    };

    prismaMock.application.findUnique.mockResolvedValueOnce(mockApplication);
    prismaMock.application.count.mockResolvedValueOnce(5); // Capacity reached

    try {
      await updateApplicationStatus(null, { id: '1', status: 'ACCEPTED' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Cannot accept application: Event capacity reached.');
      expect(error.extensions.code).toBe('FORBIDDEN');
    }
  });

  it('should handle OCC conflict', async () => {
    const mockApplication = {
      id: '1',
      status: 'PENDING',
      event: {
        id: '1',
        creatorId: 'test-user-id',
        updatedAt: new Date('2024-10-01T00:00:00Z'),
        capacity: 10,
      },
    };

    prismaMock.application.findUnique.mockResolvedValueOnce(mockApplication);
    prismaMock.application.count.mockResolvedValueOnce(5); // Less than capacity
    prismaMock.event.updateMany.mockResolvedValueOnce({ count: 0 }); // No rows updated

    try {
      await updateApplicationStatus(null, { id: '1', status: 'ACCEPTED' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('Concurrency conflict: The event has been modified by another process.');
      expect(error.extensions.code).toBe('OCC_CONFLICT');
    }
  });

  it('should handle Prisma errors', async () => {
    const prismaError = new Error('Prisma error');
    prismaMock.application.findUnique.mockRejectedValueOnce(prismaError);

    try {
      await updateApplicationStatus(null, { id: '1', status: 'ACCEPTED' }, context);
    } catch {
      expect(handlePrismaErrors).toHaveBeenCalledWith(prismaError);
    }
  });
});

const { Mutation } = require('../graphql/resolvers');
const { cancelApplication } = Mutation;
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');
const { GraphQLError } = require('graphql');

// Mock Prisma
const prismaMock = {
  application: {
    deleteMany: jest.fn(),
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

describe('cancelApplication resolver', () => {
  it('should cancel the application successfully', async () => {
    prismaMock.application.deleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await cancelApplication(null, { eventId: '1' }, context);

    expect(prismaMock.application.deleteMany).toHaveBeenCalledWith({
      where: {
        eventId: '1',
        userId: 'test-user-id',
      },
    });

    expect(result).toBe(true);
  });

  it('should throw an error if no application was found to cancel', async () => {
    prismaMock.application.deleteMany.mockResolvedValueOnce({ count: 0 });

    try {
      await cancelApplication(null, { eventId: '1' }, context);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe('No application found to cancel.');
      expect(error.extensions.code).toBe('NOT_FOUND');
    }
  });

  it('should handle Prisma errors', async () => {
    const prismaError = new Error('Prisma error');
    prismaMock.application.deleteMany.mockRejectedValueOnce(prismaError);

    try {
      await cancelApplication(null, { eventId: '1' }, context);
    } catch {
      expect(handlePrismaErrors).toHaveBeenCalledWith(prismaError);
    }
  });
});

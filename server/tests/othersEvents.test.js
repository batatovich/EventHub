const { Query } = require('../graphql/resolvers');
const { othersEvents } = Query;
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');

const prismaMock = {
  event: {
    findMany: jest.fn(),
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

describe('othersEvents resolver', () => {
  it('should return other users’ events with application statuses', async () => {
    const mockEvents = [
      { 
        id: '1', 
        name: 'Event 1', 
        date: new Date('2024-10-01'), 
        applications: [{ status: 'PENDING' }] 
      },
      { 
        id: '2', 
        name: 'Event 2', 
        date: new Date('2024-09-01'), 
        applications: [] 
      },
    ];

    prismaMock.event.findMany.mockResolvedValueOnce(mockEvents);

    const result = await othersEvents(null, null, context);

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { creatorId: { not: 'test-user-id' } },
      include: {
        applications: {
          where: { userId: 'test-user-id' },
          select: { status: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    expect(result).toEqual([
      { 
        id: '1', 
        name: 'Event 1', 
        date: new Date('2024-10-01'), 
        applications: [{ status: 'PENDING' }],
        applicationStatus: [{ status: 'PENDING' }],
      },
      { 
        id: '2', 
        name: 'Event 2', 
        date: new Date('2024-09-01'), 
        applications: [],
        applicationStatus: null,
      },
    ]);
  });

  it('should handle Prisma errors', async () => {
    const error = new Error('Prisma error');
    prismaMock.event.findMany.mockRejectedValueOnce(error);

    try {
      await othersEvents(null, null, context);
    } catch {
      expect(handlePrismaErrors).toHaveBeenCalledWith(error);
    }
  });
});

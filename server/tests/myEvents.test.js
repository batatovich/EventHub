const { Query } = require('../graphql/resolvers');
const { myEvents } = Query;
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
  jest.mock('../graphql/PrismaErrorHandler', () => ({
    handlePrismaErrors: jest.fn(),
  }));

describe('myEvents resolver', () => {
  it('should return events sorted by date', async () => {
    const mockEvents = [
      { id: '1', name: 'Event 1', date: new Date('2024-10-01') },
      { id: '2', name: 'Event 2', date: new Date('2024-09-01') },
    ];

    prismaMock.event.findMany.mockResolvedValueOnce(mockEvents);

    const result = await myEvents(null, null, context);

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { creatorId: 'test-user-id' },
      orderBy: { date: 'asc' },
    });

    expect(result).toEqual(mockEvents);
  });

  it('should handle Prisma errors', async () => {
    const error = new Error('Prisma error');
    prismaMock.event.findMany.mockRejectedValueOnce(error);

    try {
      await myEvents(null, null, context);
    } catch {
      expect(handlePrismaErrors).toHaveBeenCalledWith(error);
    }
  });
});

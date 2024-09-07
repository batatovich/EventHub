const { Mutation } = require('../graphql/resolvers');
const { deleteEvent } = Mutation;
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');
const { GraphQLError } = require('graphql');

// Mock Prisma
const prismaMock = {
    event: {
        findUnique: jest.fn(),
        delete: jest.fn(),
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

describe('deleteEvent resolver', () => {
    it('should delete an event successfully', async () => {
        const mockEvent = { id: '1', creatorId: 'test-user-id' };
        prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);
        prismaMock.event.delete.mockResolvedValueOnce(true);

        const result = await deleteEvent(null, { id: '1' }, context);

        expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
        });
        expect(prismaMock.event.delete).toHaveBeenCalledWith({
            where: { id: '1' },
        });
        expect(result).toBe(true);
    });

    it('should throw an error if the event ID is not provided', async () => {
        try {
            await deleteEvent(null, { id: null }, context);
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError);
            expect(error.message).toBe('Event ID is required.');
            expect(error.extensions.code).toBe('BAD_USER_INPUT');
        }
    });

    it('should throw an error if the event is not found', async () => {
        prismaMock.event.findUnique.mockResolvedValueOnce(null);

        try {
            await deleteEvent(null, { id: '1' }, context);
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError);
            expect(error.message).toBe('Event not found.');
            expect(error.extensions.code).toBe('NOT_FOUND');
        }
    });

    it('should throw an error if the user is not the event creator', async () => {
        const mockEvent = { id: '1', creatorId: 'other-user-id' };
        prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);

        try {
            await deleteEvent(null, { id: '1' }, context);
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError);
            expect(error.message).toBe('You do not have permission to delete this event.');
            expect(error.extensions.code).toBe('FORBIDDEN');
        }
    });

    it('should handle Prisma errors', async () => {
        const mockEvent = { id: '1', creatorId: 'test-user-id' };
        const prismaError = new Error('Prisma error');
        prismaMock.event.findUnique.mockResolvedValueOnce(mockEvent);
        prismaMock.event.delete.mockRejectedValueOnce(prismaError);

        try {
            await deleteEvent(null, { id: '1' }, context);
        } catch {
            expect(handlePrismaErrors).toHaveBeenCalledWith(prismaError);
        }
    });
});

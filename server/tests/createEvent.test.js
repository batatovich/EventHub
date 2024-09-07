¡const { Mutation } = require('../graphql/resolvers');
const { createEvent } = Mutation;
const { CreateEventSchema } = require('../graphql/validation-schemas');
const { handlePrismaErrors } = require('../graphql/prismaErrorHandler');

// Mock Prisma and Yup
const prismaMock = {
    event: {
        create: jest.fn(),
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

// Mock the validation schema
jest.mock('../graphql/validation-schemas', () => ({
    CreateEventSchema: {
        validate: jest.fn(),
    },
}));

// Mock console.log to avoid cluttering the test output
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('createEvent resolver', () => {
    it('should create a new event successfully', async () => {
        const mockEvent = { id: '1', name: 'Test Event' };
        prismaMock.event.create.mockResolvedValueOnce(mockEvent);
        CreateEventSchema.validate.mockResolvedValueOnce();

        const result = await createEvent(
            null,
            {
                name: 'Test Event',
                description: 'An event',
                location: 'Test City',
                date: '2024-10-10T00:00:00Z',
                capacity: '100',
                fee: '10',
            },
            context
        );

        expect(CreateEventSchema.validate).toHaveBeenCalledWith(
            {
                name: 'Test Event',
                description: 'An event',
                location: 'Test City',
                date: '2024-10-10T00:00:00Z',
                capacity: '100',
                fee: '10',
            },
            { abortEarly: false }
        );

        expect(prismaMock.event.create).toHaveBeenCalledWith({
            data: {
                name: 'Test Event',
                description: 'An event',
                location: 'Test City',
                date: '2024-10-10T00:00:00Z',
                capacity: 100,
                fee: 10,
                creatorId: 'test-user-id',
            },
        });

        expect(result).toEqual(mockEvent);
    });

    it('should handle validation errors from Yup', async () => {
        const validationError = {
            name: 'ValidationError',
            inner: [{ path: 'name', message: 'Name is required' }],
        };
        CreateEventSchema.validate.mockRejectedValueOnce(validationError);

        try {
            await createEvent(
                null,
                {
                    name: '',
                    description: 'An event',
                    location: 'Test City',
                    date: '2024-10-10T00:00:00Z',
                    capacity: '100',
                    fee: '10',
                },
                context
            );
        } catch (error) {
            expect(error.message).toBe('Validation failed');
            expect(error.extensions.validationErrors).toEqual([{ path: 'name', message: 'Name is required' }]);
        }
    });

    it('should handle Prisma errors', async () => {
        const prismaError = new Error('Prisma error');
        prismaMock.event.create.mockRejectedValueOnce(prismaError);

        try {
            await createEvent(
                null,
                {
                    name: 'Test Event',
                    description: 'An event',
                    location: 'Test City',
                    date: '2024-10-10T00:00:00Z',
                    capacity: '100',
                    fee: '10',
                },
                context
            );
        } catch {
            expect(handlePrismaErrors).toHaveBeenCalledWith(prismaError);
        }
    });
});

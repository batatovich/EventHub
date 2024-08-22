const request = require('supertest');
const setupServer = require('../setup-server');
const prisma = require('../prisma-client');

// Initialize the server
let app;

beforeAll(async () => {
  app = await setupServer({ prisma });
});

afterAll(async () => {
  // Clean up database and close Prisma connection
  await prisma.user.deleteMany(); // Cleanup test data
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('should successfully sign up a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe('User registered successfully!');
  });

  it('should return an error if email is already registered', async () => {
    // Sign up the first user
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    // Try signing up with the same email again
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe('Email already registered.');
  });

  it('should return an error if passwords do not match', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'mismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'Password321!',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Passwords do not match.');
  });
});

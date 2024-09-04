const request = require('supertest');
const prisma = require('../prisma-client');
const setupServer = require('../express-server');

// Initialize the server
let app;

beforeAll(async () => {
  app = await setupServer({ prisma });
});

afterAll(async () => {
  // Clean up test data
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'test@example.com' },
        { email: 'duplicate@example.com' },
        { email: 'mismatch@example.com' },
        { email: 'invalid-email@example.com' }
      ]
    }
  });  
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'test@example.com' },
        { email: 'duplicate@example.com' },
        { email: 'mismatch@example.com' },
        { email: 'invalid-email@example.com' }
      ]
    }
  });
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
    expect(response.body.status).toBe('success');
    expect(response.body.data.message).toBe('User registered successfully!');
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
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toBe('Email already registered.');
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
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toBe('Passwords do not match');
  });

  it('should return validation errors for invalid input', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'invalid-email',
        password: 'pass', 
        confirmPassword: 'pass',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toContain('Please enter a valid email address');
    expect(response.body.data.message).toContain('Password must be at least 8 characters');
    expect(response.body.data.message).toContain('Password must contain at least one uppercase letter');
    expect(response.body.data.message).toContain('Password must contain at least one special character');
  });
});

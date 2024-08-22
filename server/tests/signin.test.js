const request = require('supertest');
const setupServer = require('../setup-server');
const prisma = require('../prisma-client');
const bcrypt = require('bcrypt');

let app;

beforeAll(async () => {
  app = await setupServer({ prisma });
  
  // Create a test user directly in the database
  await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password: await bcrypt.hash('Password123!', 10), // Hash the password
    },
  });
});

afterAll(async () => {
  // Clean up database and close Prisma connection
  await prisma.user.deleteMany(); // Cleanup test data
  await prisma.$disconnect();
});

describe('POST /api/auth/signin', () => {
  it('should successfully sign in with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'testuser@example.com',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe('Signed in successfully!');
  });

  it('should return an error for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'testuser@example.com',
        password: 'WrongPassword!',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid credentials.');
  });

  it('should return an error if the user does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid credentials.');
  });
});

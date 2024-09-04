const bcrypt = require('bcrypt');
const request = require('supertest');
const prisma = require('../prisma-client');
const setupServer = require('../express-server');

let app;

beforeAll(async () => {
  app = await setupServer({ prisma }); 

  const existingUser = await prisma.user.findUnique({
    where: { email: 'testuser@example.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        password: await bcrypt.hash('Password123!', 10), 
      },
    });
  }
});


afterAll(async () => {
  // Clean up database and close Prisma connection
  await prisma.user.deleteMany({
    where: {
      email: 'testuser@example.com'
    }
  });  await prisma.$disconnect();
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
    expect(response.body.status).toBe('success');
    expect(response.body.data.message).toBe('Signed in successfully!');
  });
  
  it('should return an error for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'testuser@example.com',
        password: 'WrongPassword!',
      });
  
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toBe('Invalid credentials.');
  });
  
  it('should return an error if the user does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistentuser@example.com',
        password: 'Password123!',
      });
  
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toBe('Invalid credentials.');
  });
  
  it('should return validation errors for invalid input', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'invalid-email',
        password: '',
      });
  
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.data.message).toContain('Please enter a valid email address');
    expect(response.body.data.message).toContain('Password is required');
  });
  
});

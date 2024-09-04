const request = require('supertest');
const express = require('express');
const createSignOutRoute = require('../api/signout');
const { deleteSession } = require('../services/session');

// Mock the deleteSession function
jest.mock('../services/session', () => ({
    deleteSession: jest.fn(),
}));

describe('POST /api/auth/signout', () => {
    let app;

    beforeAll(() => {
        // Setup the express app with the signout route
        app = express();
        app.use('/api/auth/signout', createSignOutRoute(null));
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear the mock after each test
    });

    it('should sign out successfully', async () => {
        // Mock the deleteSession to not throw any error
        deleteSession.mockImplementation((req, res) => res.clearCookie('session'));

        const response = await request(app)
            .post('/api/auth/signout');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.message).toBe('Signed out successfully!');
        expect(deleteSession).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during sign out', async () => {
        // Mock the deleteSession to throw an error
        deleteSession.mockImplementation(() => {
          throw new Error('Failed to delete session');
        });
      
        const response = await request(app).post('/api/auth/signout');
      
        expect(response.statusCode).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('An unexpected error occurred.');
        expect(deleteSession).toHaveBeenCalledTimes(1);
      });
      
});

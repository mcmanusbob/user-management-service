const request = require('supertest');
const mongoose = require('mongoose');
const App = require('../src/app');
const User = require('../src/models/userModel');
const db = require('../src/config/db');

describe('User Controller', () => {
  let app;
  let server;
  let userToken;
  let testUser;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize app
    const appInstance = new App();
    await appInstance.initialize();
    app = appInstance.app;
    server = appInstance.server;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
    
    // Create test user
    testUser = {
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should not register user with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          password: 'weak'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should not register user with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register user first
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens).toBeDefined();
      
      userToken = response.body.data.tokens.accessToken;
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not login non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
      // Register and login user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      userToken = registerResponse.body.data.tokens.accessToken;
    });

    it('should get current user info', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should not get user info without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and login user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      userToken = registerResponse.body.data.tokens.accessToken;
      refreshToken = registerResponse.body.data.tokens.refreshToken;
    });

    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import authRoutes from '../../server/routes/auth.js';
import User from '../../server/models/User.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints (FR38, FR40)', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('FR38: Should register a new account', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({ _id: 'user123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newstudent',
        email: 'newstudent@ntnu.no',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully.');
    expect(User.create).toHaveBeenCalled();
  });

  it('FR38: Should reject non-NTNU email addresses', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'externaluser',
        email: 'external@gmail.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('NTNU');
  });

  it('FR38: Should reject registration when username or email already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ _id: 'existing-user' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newstudent',
        email: 'newstudent@ntnu.no',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toContain('already in use');
  });

  it('FR40: Should log in an existing user and return a token', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    User.findOne = jest.fn().mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      username: 'existinguser',
      email: 'existinguser@ntnu.no',
      role: 'student',
      dashboardConfig: {
        showGraph: true,
        showGuidelines: true,
        showResources: true,
        showFeedback: true,
      },
      passwordHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'existinguser',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  it('FR40: Should reject login with invalid password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    User.findOne = jest.fn().mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      username: 'existinguser',
      email: 'existinguser@ntnu.no',
      role: 'student',
      dashboardConfig: {
        showGraph: true,
        showGuidelines: true,
        showResources: true,
        showFeedback: true,
      },
      passwordHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'existinguser',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('Invalid credentials');
  });
});

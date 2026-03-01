import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import apiRoutes from '../routes/api.js';

// Mock the Models
import UsageEntry from '../models/UsageEntry.js';
import Guideline from '../models/Guideline.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

const AUTH_USER_ID = '507f191e810c19729de860ea';
const authTokenFor = (role = 'student') => jwt.sign(
  { id: AUTH_USER_ID, username: 'test-user', role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('API Endpoints Validation Loop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  it('FR9: GET /api/usage should return usage entries', async () => {
    UsageEntry.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ tool: 'ChatGPT', hours: 2 }]) });
    
    const res = await request(app)
      .get('/api/usage')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(UsageEntry.find).toHaveBeenCalledWith({ userId: AUTH_USER_ID });
  });

  it('FR10: GET /api/usage should filter by tool', async () => {
    UsageEntry.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    
    const res = await request(app)
      .get('/api/usage?tool=Claude')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(200);
    expect(UsageEntry.find).toHaveBeenCalledWith(expect.objectContaining({
      tool: 'Claude',
      userId: AUTH_USER_ID
    }));
  });

  it('FR4 & FR5: POST /api/logs should create usage log with required fields', async () => {
    UsageEntry.create = jest.fn().mockResolvedValue({
      _id: 'entry123',
      userId: AUTH_USER_ID,
      tool: 'ChatGPT',
      task: 'Research',
      aiOutput: 'Summarised key points',
      hours: 1.5,
    });

    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${authTokenFor('student')}`)
      .send({
        tool: 'ChatGPT',
        task: 'Research',
        aiOutput: 'Summarised key points',
        hours: 1.5,
        subject: 'Computer Science',
        assignmentId: 'TDT4242-A2-2026',
      });

    expect(res.statusCode).toEqual(201);
    expect(UsageEntry.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: AUTH_USER_ID,
      tool: 'ChatGPT',
      task: 'Research',
      aiOutput: 'Summarised key points',
      hours: 1.5,
    }));
  });

  it('FR5: POST /api/logs should reject invalid payloads', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${authTokenFor('student')}`)
      .send({ tool: 'ChatGPT', hours: 2 });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('FR11: GET /api/guidelines should return ethical guidelines', async () => {
    Guideline.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ title: 'Be Honest' }]) });
    
    const res = await request(app)
      .get('/api/guidelines')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('FR12: POST /api/quiz/submit should evaluate quiz properly', async () => {
    Resource.findById = jest.fn().mockResolvedValue({
      quizQuestions: [{ question: 'Is copying ok?', expectedAnswer: 'No' }]
    });

    const res = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${authTokenFor('student')}`)
      .send({
        answers: [{ resourceId: '1', question: 'Is copying ok?', answer: 'No' }]
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.score).toEqual(100);
    expect(res.body.passed).toBeTruthy();
  });

  it('FR13: GET /api/feedback should return weekly insights', async () => {
    UsageEntry.find = jest.fn().mockResolvedValue([
      { tool: 'ChatGPT', hours: 5, date: new Date() } // Simulate recent usage
    ]);

    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('feedback');
    expect(res.body.feedback).toContain('You used AI for 5.0 hours this week');
  });

  it('FR8: GET /api/dashboard/config should return dashboard configuration', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ 
        username: 'alice', 
        dashboardConfig: { showGraph: true }
      })
    });
    
    const res = await request(app)
      .get('/api/dashboard/config')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'alice');
    expect(res.body.dashboardConfig.showGraph).toBe(true);
  });

  it('FR43: GET /api/admin/system-status should deny non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/system-status')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);
    expect(res.statusCode).toEqual(403);
  });

  it('FR43: GET /api/admin/system-status should allow admin users', async () => {
    User.countDocuments = jest.fn().mockResolvedValue(5);
    UsageEntry.countDocuments = jest.fn().mockResolvedValue(25);

    const res = await request(app)
      .get('/api/admin/system-status')
      .set('Authorization', `Bearer ${authTokenFor('admin')}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalUsers).toEqual(5);
    expect(res.body.totalUsageEntries).toEqual(25);
  });
});

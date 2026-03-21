import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import apiRoutes from '../../server/routes/api.js';

// Mock the Models
import UsageEntry from '../../server/models/UsageEntry.js';
import Guideline from '../../server/models/Guideline.js';
import Resource from '../../server/models/Resource.js';
import User from '../../server/models/User.js';

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

  it('FR12: GET /api/resources should return educational resources', async () => {
    Resource.find = jest.fn().mockResolvedValue([{ title: 'Academic Integrity', quizQuestions: [] }]);

    const res = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(Resource.find).toHaveBeenCalledTimes(1);
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

  it('FR12: POST /api/quiz/submit should fail when score is below 80', async () => {
    Resource.findById = jest.fn().mockResolvedValue({
      quizQuestions: [{ question: 'Is copying ok?', expectedAnswer: 'No' }]
    });

    const res = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${authTokenFor('student')}`)
      .send({
        answers: [{ resourceId: '1', question: 'Is copying ok?', answer: 'Yes' }]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.score).toBeLessThan(80);
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

  it('FR13: GET /api/feedback should return guidance when no recent usage exists', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 20);
    UsageEntry.find = jest.fn().mockResolvedValue([{ tool: 'ChatGPT', hours: 2, date: oldDate }]);

    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${authTokenFor('student')}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.feedback).toContain('No AI usage recorded in the past 7 days');
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

  it('FR8: PATCH /api/dashboard/config should update dashboard configuration', async () => {
    User.findByIdAndUpdate = jest.fn().mockResolvedValue({
      dashboardConfig: {
        showGraph: false,
        showGuidelines: true,
        showResources: true,
        showFeedback: true,
      },
    });

    const res = await request(app)
      .patch('/api/dashboard/config')
      .set('Authorization', `Bearer ${authTokenFor('student')}`)
      .send({ showGraph: false });

    expect(res.statusCode).toEqual(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      AUTH_USER_ID,
      { $set: { 'dashboardConfig.showGraph': false } },
      { new: true, select: 'dashboardConfig' }
    );
    expect(res.body.showGraph).toBe(false);
  });

  it('FR40/FR43: protected routes should reject requests without token', async () => {
    const res = await request(app).get('/api/usage');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
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

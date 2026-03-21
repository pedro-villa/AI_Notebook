import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import authMiddleware, { requireRole } from '../../server/middleware/auth.js';

describe('Auth middleware unit tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  it('should return 401 when Authorization header is missing', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and attach req.user for valid token', () => {
    const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1', role: 'student' });
    const req = { headers: { authorization: 'Bearer valid.token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith('valid.token', 'testsecret');
    expect(req.user).toEqual({ id: 'u1', role: 'student' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 when token verification fails', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = { headers: { authorization: 'Bearer bad.token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware unit tests', () => {
  it('should return 403 when req.user.role is missing', () => {
    const req = { user: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when role is insufficient', () => {
    const req = { user: { role: 'student' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when role is allowed', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

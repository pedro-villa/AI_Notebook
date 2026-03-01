/**
 * api.js — centralised API service
 *
 * All fetch calls to the backend go through here.
 * The token is read from localStorage on every call so it is always fresh.
 * The base URL reads from the Vite env variable VITE_API_URL, falling back
 * to localhost:5000 for local development.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const register = (payload) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const login = (username, password) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

// ── Dashboard ─────────────────────────────────────────────────────────────
export const getDashboardConfig = () => request('/api/dashboard/config');
export const patchDashboardConfig = (updates) =>
  request('/api/dashboard/config', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// ── Usage / Graph ─────────────────────────────────────────────────────────
export const getUsage = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/api/usage${qs ? '?' + qs : ''}`);
};

export const createUsageLog = (payload) =>
  request('/api/logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── Guidelines ────────────────────────────────────────────────────────────
export const getGuidelines = () => request('/api/guidelines');

// ── Resources & Quiz ──────────────────────────────────────────────────────
export const getResources = () => request('/api/resources');
export const submitQuiz = (answers) =>
  request('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

// ── Feedback ──────────────────────────────────────────────────────────────
export const getFeedback = () => request('/api/feedback');

// ── Admin ─────────────────────────────────────────────────────────────────
export const getAdminSystemStatus = () => request('/api/admin/system-status');

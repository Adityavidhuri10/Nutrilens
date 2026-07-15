import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';

// Runs once before any test in this file
beforeAll(async () => {
  await connectTestDB();
});

// Runs after every single test — keeps tests independent
afterEach(async () => {
  await clearTestDB();
});

// Runs once after all tests in this file finish
afterAll(async () => {
  await closeTestDB();
});

// A valid registration payload we'll reuse across tests
const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123',
  profile: {
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    activityLevel: 'moderate',
  },
};

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    // Password and refreshToken must NEVER be exposed in the response
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.refreshToken).toBeUndefined();
  });

  it('rejects registration with a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser); // first registration
    const res = await request(app).post('/api/auth/register').send(validUser); // duplicate

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'weak' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword123' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects login for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(res.statusCode).toBe(401);
  });
});
describe('POST /api/auth/refresh', () => {
  it('issues a new token pair with a valid refresh token, and rotates the old one out', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const oldRefreshToken = registerRes.body.data.refreshToken;

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken });

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.data.refreshToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).not.toBe(oldRefreshToken); // rotation happened

    // The OLD refresh token should no longer work, since it's been replaced
    const reuseOldRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken });

    expect(reuseOldRes.statusCode).toBe(401);
  });

  it('rejects an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'this-is-not-a-real-token' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Protected route access (auth middleware)', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects requests with an invalid/malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.statusCode).toBe(401);
  });

  it('allows access with a valid token and returns the user profile', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const { accessToken } = registerRes.body.data;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.computed.bmr).toBeDefined(); // confirms calculateBMR() ran
  });
});
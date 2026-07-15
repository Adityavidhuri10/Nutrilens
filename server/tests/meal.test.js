import { jest } from '@jest/globals';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Cloudinary — we don't want real image uploads during tests
jest.unstable_mockModule('../services/cloudinaryService.js', () => ({
  default: {
    uploadImageStream: jest.fn().mockResolvedValue({
      url: 'https://fake-cloudinary.com/test-image.jpg',
      publicId: 'fake-public-id-123',
    }),
    deleteImage: jest.fn().mockResolvedValue(true),
  },
}));

// Mock Gemini — controlled per-test so we can simulate both success and failure
jest.unstable_mockModule('../services/geminiService.js', () => ({
  default: {
    analyzeFoodImage: jest.fn(),
  },
}));

// Import everything that depends on the mocked services AFTER the mocks are registered
const app = (await import('../app.js')).default;
const geminiService = (await import('../services/geminiService.js')).default;
const User = (await import('../models/User.js')).default;

let accessToken;

const validUser = {
  name: 'Meal Test User',
  email: 'mealtest@example.com',
  password: 'Password123',
  profile: {
    age: 28,
    gender: 'female',
    height: 165,
    weight: 60,
    activityLevel: 'light',
  },
};

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  const res = await request(app).post('/api/auth/register').send(validUser);
  accessToken = res.body.data.accessToken;
});

describe('POST /api/meals — Gemini fallback behavior', () => {
  it('still creates the meal log when Gemini analysis fails', async () => {
    geminiService.analyzeFoodImage.mockRejectedValue(new Error('Gemini API down'));

    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('mealType', 'lunch')
      .attach('image', Buffer.from('fake-image-bytes'), 'meal.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body.data.nutrition.analysisStatus).toBe('failed');
    expect(res.body.data.nutrition.calories).toBe(0);
  });

  it('saves real nutrition data when Gemini succeeds', async () => {
    geminiService.analyzeFoodImage.mockResolvedValue({
      foodItems: ['Grilled Chicken', 'Rice'],
      calories: 450,
      protein: 35,
      carbs: 40,
      fats: 10,
      fiber: 3,
      analysisStatus: 'success',
    });

    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('mealType', 'dinner')
      .attach('image', Buffer.from('fake-image-bytes'), 'meal.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body.data.nutrition.analysisStatus).toBe('success');
    expect(res.body.data.nutrition.calories).toBe(450);
    expect(res.body.data.nutrition.foodItems).toContain('Grilled Chicken');
  });

  it('rejects meal creation with no image attached', async () => {
    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('mealType', 'breakfast');

    expect(res.statusCode).toBe(400);
  });
});
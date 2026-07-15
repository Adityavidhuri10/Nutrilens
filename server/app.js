import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use((req, res, next) => {
  const queryVal = req.query;
  Object.defineProperty(req, 'query', {
    value: queryVal,
    writable: true,
    configurable: true,
  });
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? env.CLIENT_URL : true,
    credentials: true,
  })
);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NutriLens AI Server is healthy 🟢',
    timestamp: new Date(),
  });
});

app.use((req, _res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

export default app;
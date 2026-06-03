import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import env from './config/env.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// ─── Middleware ─────────────────────────────────────────────────────────────
// Express 5 request compatibility fix (makes read-only req.query writable for third-party libraries)
app.use((req, res, next) => {
  const queryVal = req.query;
  Object.defineProperty(req, 'query', {
    value: queryVal,
    writable: true,
    configurable: true,
  });
  next();
});

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: true, // Allow all origins during dev, configure for prod later
    credentials: true,
  })
);

// Morgan logger for development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NutriLens AI Server is healthy 🟢',
    timestamp: new Date(),
  });
});

// Fallback for undefined routes
app.use((req, _res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 NutriLens AI Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

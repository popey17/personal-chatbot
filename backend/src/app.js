import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiLimiter, apiRoutes);

export default app;

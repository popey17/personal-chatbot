import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

export default app;

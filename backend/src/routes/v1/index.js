import express from 'express';
import { getHealth } from '../../controllers/health.js';
import { openaiLimiter } from '../../middleware/rateLimiter.js';
import uploadRoutes from './upload.js';
import searchRoutes from './search.js';
import settingsRoutes from './settings.js';

const router = express.Router();

router.get('/health', getHealth);
router.use('/upload', openaiLimiter, uploadRoutes);
router.use('/search', openaiLimiter, searchRoutes);
router.use('/settings', settingsRoutes);

export default router;

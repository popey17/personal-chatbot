import express from 'express';
import { getHealth } from '../../controllers/health.js';
import uploadRoutes from './upload.js';
import searchRoutes from './search.js';

const router = express.Router();

router.get('/health', getHealth);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);

export default router;

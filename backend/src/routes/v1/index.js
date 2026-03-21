import express from 'express';
import { getHealth } from '../../controllers/health.js';
import uploadRoutes from './upload.js';

const router = express.Router();

router.get('/health', getHealth);
router.use('/upload', uploadRoutes);

export default router;

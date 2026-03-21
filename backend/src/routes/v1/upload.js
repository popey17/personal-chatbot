import express from 'express';
import multer from 'multer';
import { processFile } from '../../utils/fileProcessor.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

/**
 * Handle file upload and text extraction
 */
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    // 1. Handle Multer Errors
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: `Server error during upload: ${err.message}` });
    }

    // 2. Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please use the field name "file".' });
    }

    try {
      const { buffer, originalname, mimetype } = req.file;
      
      // 3. Process File (Extract + Chunk + Embed + Store)
      const data = await processFile(buffer, mimetype, originalname);

      res.json({
        filename: originalname,
        ...data
      });

    } catch (error) {
      console.error('File processing error:', error);
      const status = error.message.includes('Unsupported') || error.message.includes('No readable') ? 422 : 500;
      res.status(status).json({ error: error.message });
    }
  });
});

export default router;

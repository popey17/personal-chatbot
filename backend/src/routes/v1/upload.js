import express from 'express';
import multer from 'multer';
import { processFile } from '../../utils/fileProcessor.js';
import { supabase } from '../../utils/supabaseClient.js';

const router = express.Router();

/**
 * List all processed documents
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch document list' });
  }
});

/**
 * Delete a document and its chunks
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

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

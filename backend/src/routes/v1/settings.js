import express from 'express';
import { supabase } from '../../utils/supabaseClient.js';

const router = express.Router();

/**
 * Fetch global settings
 * GET /api/v1/settings
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching settings:', error);
      // Fallback if table doesn't exist yet or other error
      return res.json({ ai_service: 'openai' });
    }

    const settings = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Unexpected error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * Update global settings
 * PATCH /api/v1/settings
 * Body: { key, value }
 * Restricted: Authenticated users only (Middleware handled or simple check)
 */
router.patch('/', async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Please provide key and value.' });
    }

    // Upsert setting
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json({ error: `Failed to update setting: ${error.message}` });
    }

    res.json({ message: `Setting ${key} updated successfully.` });
  } catch (error) {
    console.error('Unexpected error updating setting:', error);
    res.status(500).json({ error: 'Internal server error during settings update.' });
  }
});

export default router;

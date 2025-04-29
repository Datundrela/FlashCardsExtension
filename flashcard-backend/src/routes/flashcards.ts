import express from 'express';
import { pool } from '../db';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const db = await pool;
    const result = await db.request().query('SELECT * FROM Flashcards');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

export default router;

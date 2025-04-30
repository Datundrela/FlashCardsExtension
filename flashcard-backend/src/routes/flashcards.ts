import express from 'express';
import { getAllFlashcards, createFlashcard } from '../repositories/flashcardRepository';

const router = express.Router();

router.get('/', async (req, res) => {
  const flashcards = await getAllFlashcards();
  res.json(flashcards);
});

router.post('/', async (req, res) => {
  const { front, back } = req.body;
  await createFlashcard(front, back);
  res.status(201).send('Flashcard created');
});

export default router;


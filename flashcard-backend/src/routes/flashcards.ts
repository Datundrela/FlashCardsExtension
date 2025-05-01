import express from 'express';
import {
  getAllFlashcards,
  getFlashcardById,
  getFlashcardsByDifficulty,
  updateFlashcardDifficulty,
  createFlashcard
} from '../repositories/flashcardRepository';

const router = express.Router();

// GET /flashcards/
router.get('/', async (req, res) => {
  const flashcards = await getAllFlashcards();
  res.json(flashcards);
});

// GET /flashcards/:id
router.get('/:id', async (req, res) => {
  const flashcard = await getFlashcardById(req.params.id);
  if(!flashcard){
    res.status(404).send('Flascard not found');
  }
  res.json(flashcard);
})

// GET /flashcards/hard
router.get('/filter/hard', async (req, res) => {
  const hardFlashcards = await getFlashcardsByDifficulty('hard');
  res.json(hardFlashcards);
});

// GET /flashcards/easy
router.get('/filter/easy', async (req, res) => {
  const easyFlashcards = await getFlashcardsByDifficulty('easy');
  res.json(easyFlashcards);
});

// POST /flashcards/
router.post('/', async (req, res) => {
  const { front, back } = req.body;
  await createFlashcard(front, back);
  res.status(201).send('Flashcard created');
});

// PATCH /flashcards/:id/difficulty
router.patch('/:id/difficulty', async (req, res) => {
  const { difficulty } = req.body;
  await updateFlashcardDifficulty(req.params.id, difficulty);
  res.send('Difficulty updated');
});

export default router;


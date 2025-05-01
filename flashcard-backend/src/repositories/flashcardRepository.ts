import fs from 'fs/promises';
import path from 'path';
import {Flashcard} from '../flashcard';
import {Difficulty as diff} from '../flashcard'

const filePath = path.join(__dirname, '..', 'data', 'flashcards.json');

async function readFlashcards(): Promise<Flashcard[]> {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeFlashcards(flashcards: Flashcard[]) {
  await fs.writeFile(filePath, JSON.stringify(flashcards, null, 2));
}

export const getAllFlashcards = async () => {
  return await readFlashcards();
};

export const createFlashcard = async (front: string, back: string) => {
  const flashcards = await readFlashcards();

  const newCard = new Flashcard(front, back);

  flashcards.push(newCard);
  await writeFlashcards(flashcards);

  return newCard;
};

export const getFlashcardById = async (id: string) => {
  const flashcards = await readFlashcards();
  return flashcards.find(fc => fc.id === id);
};

export const getFlashcardsByDifficulty = async (difficulty: string) => {
  const flashcards = await readFlashcards();
  return flashcards.filter(fc => fc.difficulty === difficulty);
};

export const updateFlashcardDifficulty = async (id: string, difficulty: string) => {
  const flashcards = await readFlashcards();
  const index = flashcards.findIndex(fc => fc.id === id);
  if (index === -1) return null;
  flashcards[index].difficulty = difficulty as diff;
  await writeFlashcards(flashcards);
  return flashcards[index];
};

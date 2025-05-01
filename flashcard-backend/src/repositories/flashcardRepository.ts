import { pool } from '../db';

export const getAllFlashcards = async () => {
  const result = await (await pool).request().query('SELECT * FROM Flashcards');
  return result.recordset;
};

export const createFlashcard = async (front: string, back: string) => {
  const result = await (await pool).request()
    .input('Front', front)
    .input('Back', back)
    .input('Difficulty', 'new')
    .query('INSERT INTO Flashcards (Front, Back, Difficulty) VALUES (@Front, @Back, @Difficulty)');
  
  return result;
};

export const getFlashcardById = async (id: string) => {
  const result = await (await pool).request()
    .input('Id', id)
    .query('SELECT * FROM Flashcards WHERE Id = @Id');
  return result.recordset[0];
};

export const getFlashcardsByDifficulty = async (difficulty: string) => {
  const result = await (await pool).request()
    .input('Difficulty', difficulty)
    .query('SELECT * FROM Flashcards WHERE Difficulty = @Difficulty');
  return result.recordset;
};

export const updateFlashcardDifficulty = async (id: string, difficulty: string) => {
  const result = await (await pool).request()
    .input('Id', id)
    .input('Difficulty', difficulty)
    .query('UPDATE Flashcards SET Difficulty = @Difficulty WHERE Id = @Id');
  return result;
};

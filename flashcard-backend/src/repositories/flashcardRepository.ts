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
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import flashcardRoutes from './routes/flashcards';

console.log('Loaded ENV:', process.env.DB_SERVER);

dotenv.config();

const app = express();
app.use(express.json());

app.use('/flashcards', flashcardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
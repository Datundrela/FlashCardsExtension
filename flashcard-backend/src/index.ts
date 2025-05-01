import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import flashcardRoutes from './routes/flashcards';
import bodyParser from 'body-parser';

import cors from 'cors';

console.log('Loaded ENV:', process.env.DB_SERVER);

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/flashcards', flashcardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
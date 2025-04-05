import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import submitForm from './controllers/profileController.js';
import connectDB from './dbConnect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

connectDB();

app.post('/api/form-submit', submitForm);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

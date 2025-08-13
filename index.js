import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import submitForm, { createCustomField, getProfilesList } from './controllers/profileController.js';
import connectDB from './dbConnect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://smartimmigrant.com' , 'https://uk.smartimmigrant.com'],
}));

app.use(bodyParser.json());

connectDB();

app.post('/api/form-submit', submitForm);
app.get('/api/profiles', getProfilesList);
app.get('/api/custom-fields', createCustomField);

app.get('/', (req, res) => {
  res.status(200).json({message :'API is running...'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

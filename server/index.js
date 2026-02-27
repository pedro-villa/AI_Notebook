import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Fake mongo connection just to have the structure
// Normally you would do: mongoose.connect(process.env.MONGO_URI);

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

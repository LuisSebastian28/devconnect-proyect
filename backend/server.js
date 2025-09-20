import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded:');
console.log('PARA_API_KEY AAA:', process.env.PARA_API_KEY ? 'Present' : 'Missing');
console.log('ENCRYPTION_KEY AAA:', process.env.ENCRYPTION_KEY ? 'Present' : 'Missing');

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import BlockchainConnection from './config/blockchain.js'; 
import ParaInstanceManager from './config/para.js';


const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());


const blockchainConnection = BlockchainConnection.getInstance();
//const paraManager = ParaInstanceManager.getInstance();

// Rutas
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
});
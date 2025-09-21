import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded:');
console.log('LIVY_API_KEY:', process.env.LIVY_API_KEY ? 'Present' : 'Missing');
console.log('LIVY_SERVICE_ID:', process.env.LIVY_SERVICE_ID ? 'Present' : 'Missing');
console.log('PARA_API_KEY AAA:', process.env.PARA_API_KEY ? 'Present' : 'Missing');
console.log('ENCRYPTION_KEY AAA:', process.env.ENCRYPTION_KEY ? 'Present' : 'Missing');

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import livyRoutes from './livy-services/routes/livyRoutes.js';
import documentRoutes from './livy-services/routes/documentRoutes.js';
import BlockchainConnection from './config/blockchain.js'; 
import transferRoutes from './routes/transfer.js'

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const blockchainConnection = BlockchainConnection.getInstance();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/livy', livyRoutes);
app.use('/api/livy', documentRoutes);
app.use('/api/transfer', transferRoutes);

// ✅ ADD THIS ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Backend server is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      livy: '/api/livy'
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
});
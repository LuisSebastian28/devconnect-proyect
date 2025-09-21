import express from 'express';
import transferController from '../controllers/transferController.js';

const router = express.Router();

// Transferir USDT
router.post('/usdt', transferController.transferUSDT);


router.post('/eth', transferController.transferETH);
router.get('/status/:txHash', transferController.getTransactionStatus);
router.get('/history/:phone', transferController.getTransferHistory);

export default router;
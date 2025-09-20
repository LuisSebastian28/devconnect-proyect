import express from 'express';
import authController from '../controllers/authController.js';
import WalletRepository from '../repository/walletRepository.js';
import UserService from '../services/userService.js';
import WalletService from '../services/walletService.js';   

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const userService = new UserService(walletRepository, walletService);
const controller = authController(userService);

const router = express.Router();

router.post('/register/investor', controller.registerInvestor);
router.post('/register/entrepreneur', controller.registerEntrepreneur);
router.post('/login', controller.login);

export default router;
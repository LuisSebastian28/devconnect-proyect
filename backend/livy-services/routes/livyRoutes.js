// livy-services/routes/livyRoutes.js
import express from 'express';
import livyController from '../controllers/livyController.js';

const controller = livyController();

const router = express.Router();

router.get('/health', controller.healthCheck);
router.get('/config', controller.getConfig);
router.post('/verify-number', controller.verifyNumberHandler);

export default router;
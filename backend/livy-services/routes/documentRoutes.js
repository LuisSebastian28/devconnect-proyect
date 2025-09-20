// livy-services/routes/documentRoutes.js
import express from 'express';
import documentController from '../controllers/documentController.js';

const controller = documentController();
const router = express.Router();

router.post('/verify-document', controller.verifyDocumentHandler);

export default router;
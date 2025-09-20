// livy-services/controllers/documentController.js
import { verifyDocumentHash } from '../document-verifier.js';

export const documentController = () => {
  const verifyDocumentHandler = async (req, res) => {
    try {
      const { hash } = req.body;

      if (typeof hash !== 'string' || hash.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          error: 'Hash is required and must be a non-empty string',
          input: hash 
        });
      }

      const result = await verifyDocumentHash(hash);
      
      res.json(result);
      
    } catch (error) {
      console.error('Error en verifyDocumentHandler:', error);
      
      if (error.code === 'SERVICE_NOT_FOUND' || error.message.includes('access denied')) {
        return res.status(400).json({
          success: false,
          error: 'Service not configured properly',
          type: 'service_config_error'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        type: 'server_error'
      });
    }
  };

  return {
    verifyDocumentHandler
  };
};

export default documentController;
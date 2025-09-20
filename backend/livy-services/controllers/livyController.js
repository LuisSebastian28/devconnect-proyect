// livy-services/controllers/livyController.js
import { verifyNumber } from '../number-verifier.js';

export const livyController = () => {
  const healthCheck = (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.LIVY_API_KEY,
      hasServiceId: !!process.env.LIVY_SERVICE_ID,
      serviceId: process.env.LIVY_SERVICE_ID
    });
  };

  const getConfig = (req, res) => {
    res.json({
      livyApiKey: process.env.LIVY_API_KEY ? 'Configured' : 'Not configured',
      livyServiceId: process.env.LIVY_SERVICE_ID ? 'Configured' : 'Not configured',
      serviceId: process.env.LIVY_SERVICE_ID,
      serverPort: process.env.PORT || 3001,
      environment: process.env.NODE_ENV || 'development'
    });
  };

  const verifyNumberHandler = async (req, res) => {
    try {
      const { number } = req.body;

      if (typeof number !== 'number') {
        return res.status(400).json({ 
          success: false, 
          error: 'Number is required and must be a number',
          input: number 
        });
      }

      const result = await verifyNumber(number);
      
      // 🔥 MANTENER LA MISMA ESTRUCTURA DE RESPUESTA QUE TU SERVER ANTERIOR
      res.json(result);
      
    } catch (error) {
      console.error('Error en verifyNumberHandler:', error);
      
      // 🔥 MANTENER EL MISMO FORMATO DE ERROR
      if (error.code === 'INVALID_PARAMS' || error.message.includes('RA service execution failed')) {
        return res.status(200).json({
          success: false,
          service: 'number-verifier',
          output: {
            success: false,
            message: `❌ Incorrect! Expected 5, got ${req.body.number}`,
            input: req.body.number.toString(),
            expected: "5",
            is_correct: false
          },
          proofValid: false,
          type: 'number_verification_failed',
          livyError: {
            code: error.code,
            message: error.message
          }
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
    healthCheck,
    getConfig,
    verifyNumberHandler
  };
};

export default livyController;
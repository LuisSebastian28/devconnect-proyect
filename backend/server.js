// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Importa el SDK de Livy
const { createClient, SDKError } = require('@livylabs/sdk');

// 🔥 VALORES DIRECTAMENTE EN EL CÓDIGO (sin .env)
const LIVY_API_KEY = 'sk-48dee2675021db35f271f6999f11cd3fa70ddaac1617089c24e871e597317584';
const LIVY_SERVICE_ID = 'd1890c1a-f3aa-4bca-b3fb-b19f3e905fa9';

app.post('/api/verify-number', async (req, res) => {
  try {
    const { number } = req.body;

    if (typeof number !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Number is required and must be a number',
        input: number 
      });
    }

    const client = createClient({ apiKey: LIVY_API_KEY });
    
    // 🔥 CONVERTIR A STRING - Esto es lo que Livy espera
    const params = {
      number: number.toString() // 🔥 ¡Ahora es string!
    };

    console.log('Enviando a Livy:', { serviceId: LIVY_SERVICE_ID, params });

    const result = await client.run({
      serviceId: LIVY_SERVICE_ID,
      params: params,
      withAttestation: true,
    });

    console.log('Respuesta de Livy:', result.output);

    const proofValid = await result.verifyAttestation();

    // Parsear el output JSON
    let output;
    try {
      output = JSON.parse(result.output);
    } catch (parseError) {
      output = { 
        rawOutput: result.output,
        success: result.output.includes('✅') || !result.output.includes('❌')
      };
    }

    res.json({
      success: true,
      service: 'number-verifier',
      output: output,
      proofValid: proofValid,
      attestation: result.attestation,
      livyResult: {
        status: result.status,
        serviceId: result.serviceId,
        postedToDataAvailability: result.postedToDataAvailability
      }
    });

  } catch (error) {
    console.error('Error detallado en /api/verify-number:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error instanceof SDKError) {
      // 🔥 MANEJO ESPECIAL PARA CUANDO EL NÚMERO ES INCORRECTO
      if (error.code === 'INVALID_PARAMS' || error.message.includes('RA service execution failed')) {
        // Esto probablemente significa que el número era incorrecto (exit code 1 de Rust)
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
      
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
        type: 'livy_sdk_error',
        details: 'Revisa la configuración del servicio en Livy'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      type: 'server_error'
    });
  }
});

// Endpoint de salud para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    hasApiKey: !!LIVY_API_KEY,
    hasServiceId: !!LIVY_SERVICE_ID,
    serviceId: LIVY_SERVICE_ID
  });
});

// Endpoint para obtener info de configuración
app.get('/api/config', (req, res) => {
  res.json({
    livyApiKey: LIVY_API_KEY ? 'Configured' : 'Not configured',
    livyServiceId: LIVY_SERVICE_ID ? 'Configured' : 'Not configured',
    serviceId: LIVY_SERVICE_ID,
    serverPort: port,
    environment: 'production'
  });
});

app.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
  console.log(`🔑 Livy API Key: ${LIVY_API_KEY ? 'Configured' : 'NOT configured'}`);
  console.log(`🆔 Livy Service ID: ${LIVY_SERVICE_ID ? 'Configured' : 'NOT configured'}`);
  console.log(`📋 Service ID: ${LIVY_SERVICE_ID}`);
  console.log(`🌐 Health check: http://localhost:${port}/api/health`);
  console.log(`⚙️  Config info: http://localhost:${port}/api/config`);
});
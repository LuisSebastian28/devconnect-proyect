// livy-services/document-verifier.js
import { createClient, SDKError } from '@livylabs/sdk';

const LIVY_API_KEY = process.env.LIVY_API_KEY;
const DOCUMENT_SERVICE_ID = process.env.LIVY_DOCUMENT_SERVICE_ID; // Nuevo environment variable

export const verifyDocumentHash = async (hash) => {
  try {
    if (typeof hash !== 'string' || hash.trim() === '') {
      throw new Error('Hash is required and must be a non-empty string');
    }

    const client = createClient({ apiKey: LIVY_API_KEY });
    
    const params = {
      hash: hash.trim()
    };

    console.log('Enviando hash a Livy Document Verifier:', { 
      serviceId: DOCUMENT_SERVICE_ID, 
      hash: hash 
    });

    const result = await client.run({
      serviceId: DOCUMENT_SERVICE_ID,
      params: params,
      withAttestation: true,
    });

    console.log('Respuesta de Livy Document Verifier:', result.output);

    const proofValid = await result.verifyAttestation();

    // Parsear el output JSON
    let output;
    try {
      output = JSON.parse(result.output);
    } catch (parseError) {
      console.error('Error parsing Livy response:', parseError);
      output = { 
        rawOutput: result.output,
        success: false,
        message: 'Error parsing verification response'
      };
    }

    return {
      success: output.success || false,
      service: 'document-verifier',
      output: output,
      proofValid: proofValid,
      attestation: result.attestation,
      livyResult: {
        status: result.status,
        serviceId: result.serviceId,
        postedToDataAvailability: result.postedToDataAvailability
      }
    };

  } catch (error) {
    console.error('Error en verifyDocumentHash:', error);
    
    if (error instanceof SDKError) {
      if (error.code === 'INVALID_PARAMS' || error.message.includes('RA service execution failed')) {
        return {
          success: false,
          service: 'document-verifier',
          output: {
            success: false,
            message: `❌ Error en verificación: ${error.message}`,
            input_hash: hash,
            is_valid: false
          },
          proofValid: false,
          type: 'document_verification_failed'
        };
      }
      
      throw new Error(`Livy SDK Error: ${error.message}`);
    }
    
    throw error;
  }
};
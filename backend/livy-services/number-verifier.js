// livy-services/number-verifier.js
import { createClient, SDKError } from '@livylabs/sdk';

const LIVY_API_KEY = process.env.LIVY_API_KEY || 'sk-48dee2675021db35f271f6999f11cd3fa70ddaac1617089c24e871e597317584';
const LIVY_SERVICE_ID = process.env.LIVY_SERVICE_ID || 'd1890c1a-f3aa-4bca-b3fb-b19f3e905fa9';

export const verifyNumber = async (number) => {
  try {
    if (typeof number !== 'number') {
      throw new Error('Number is required and must be a number');
    }

    const client = createClient({ apiKey: LIVY_API_KEY });
    
    const params = {
      number: number.toString()
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

    // 🔥 DEVOLVER EXACTAMENTE LA MISMA ESTRUCTURA QUE TU SERVER ANTERIOR
    return {
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
    };

  } catch (error) {
    console.error('Error en verifyNumber:', error);
    
    // 🔥 PROPAGAR EL ERROR PARA QUE EL CONTROLADOR LO MANEJE
    throw error;
  }
};
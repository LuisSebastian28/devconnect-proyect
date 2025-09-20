import { useState } from 'react';

interface NumberVerifierProps {
  expectedNumber?: number;
}

interface VerificationResponse {
  success: boolean;
  service: string;
  output: {
    success: boolean;
    message: string;
    input: string;
    expected: string;
    is_correct: boolean;
  };
  proofValid: boolean;
  attestation?: any;
  livyResult: {
    status: string;
    serviceId: string;
    postedToDataAvailability: boolean;
  };
}

export default function NumberVerifier({ expectedNumber = 5 }: NumberVerifierProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proofValid, setProofValid] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsCorrect(null);
    setProofValid(null);
    
    const number = parseInt(inputValue);
    
    if (isNaN(number)) {
      setMessage('⚠️ Por favor ingresa un número válido');
      setIsCorrect(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/livy/verify-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number }),
      });

      // ✅ PRIMERO verifica si la respuesta HTTP es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data: VerificationResponse = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.output.message}`);
        setIsCorrect(true);
        setProofValid(data.proofValid);
      } else {
        setMessage(`❌ ${data.output.message}`);
        setIsCorrect(false);
        setProofValid(data.proofValid);
      }

    } catch (error) {
      console.error('Error al verificar el número:', error);
      // ✅ MEJOR MANEJO DE ERRORES
      setMessage(error instanceof Error ? `⚠️ ${error.message}` : '⚠️ Error inesperado');
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setMessage('');
    setIsCorrect(null);
    setProofValid(null);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h2>Verificador de Número con Livy 🔢</h2>
      <p>Ingresa el número correcto (debería ser {expectedNumber})</p>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '-0.5rem' }}>
        Verificación ejecutada en TEE con attestation proof
      </p>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ingresa un número"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              marginRight: '0.5rem',
              width: '150px',
              border: '2px solid #ccc',
              borderRadius: '4px',
              opacity: isLoading ? 0.7 : 1
            }}
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!inputValue.trim() || isLoading) ? 0.6 : 1
            }}
          >
            {isLoading ? '⏳ Verificando...' : '🔐 Verificar con Livy'}
          </button>
        </div>
      </form>

      {message && (
        <div style={{
          padding: '1rem',
          margin: '1rem 0',
          border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`,
          borderRadius: '4px',
          backgroundColor: isCorrect ? '#d4edda' : '#f8d7da'
        }}>
          <strong>{message}</strong>
          
          {proofValid !== null && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.9rem',
              color: isCorrect ? '#155724' : '#721c24'
            }}>
              <strong>Attestation Proof:</strong> {proofValid ? '✅ Válido' : '❌ Inválido'}
            </div>
          )}
          
          {isCorrect && proofValid && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.8rem',
              color: '#155724',
              fontStyle: 'italic'
            }}>
              ✓ Ejecutado en entorno TEE confiable
            </div>
          )}
        </div>
      )}

      {(message || inputValue) && (
        <button
          onClick={handleReset}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          Reiniciar
        </button>
      )}

      {isLoading && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #007bff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '0.5rem'
            }}></div>
            Verificando en Livy TEE...
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
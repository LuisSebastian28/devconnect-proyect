import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { calculateHash } from '../utils/hashUtils';

interface VerificationResponse {
  success: boolean;
  service: string;
  output: {
    success: boolean;
    message: string;
    input_hash: string;
    valid_hashes_count: number;
    is_valid: boolean;
  };
  proofValid: boolean;
  attestation?: any;
  livyResult: {
    status: string;
    serviceId: string;
    postedToDataAvailability: boolean;
  };
}

const FileHashCalculator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setVerificationResult(null);
    
    if (file) {
      calculateAndVerifyHash(file);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const calculateAndVerifyHash = async (file: File) => {
    setIsCalculating(true);

    try {
      // 1. Calcular hash SHA-256 del archivo
      const arrayBuffer = await file.arrayBuffer();
      const fileHash = await calculateHash(arrayBuffer, 'SHA-256');

      // 2. Verificar automáticamente con Livy
      setIsVerifying(true);
      await verifyHashWithLivy(fileHash);

    } catch (error) {
      console.error('Error procesando el archivo:', error);
      setVerificationResult({
        success: false,
        service: 'document-verifier',
        output: {
          success: false,
          message: '❌ Error al procesar el archivo',
          input_hash: '',
          valid_hashes_count: 0,
          is_valid: false
        },
        proofValid: false,
        livyResult: {
          status: 'error',
          serviceId: '',
          postedToDataAvailability: false
        }
      });
    } finally {
      setIsCalculating(false);
      setIsVerifying(false);
    }
  };

  const verifyHashWithLivy = async (fileHash: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/livy/verify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash: fileHash }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: VerificationResponse = await response.json();
      setVerificationResult(data);

    } catch (error) {
      console.error('Error verificando el hash:', error);
      // Mostrar mensaje de error específico
      setVerificationResult({
        success: false,
        service: 'document-verifier',
        output: {
          success: false,
          message: '❌ DOCUMENTO NO VÁLIDO: El hash no se encuentra en nuestros registros',
          input_hash: '',
          valid_hashes_count: 0,
          is_valid: false
        },
        proofValid: false,
        livyResult: {
          status: 'error',
          serviceId: '',
          postedToDataAvailability: false
        }
      });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setVerificationResult(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📁 Verificador de Documentos con Livy</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Arrastra y suelta un documento o haz clic para seleccionarlo. La verificación se realizará automáticamente.
      </p>

      {/* Dropbox Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          marginBottom: '20px',
          padding: '40px',
          border: `2px dashed ${isDragOver ? '#007bff' : '#ccc'}`,
          borderRadius: '12px',
          backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>
          📁
        </div>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
          {selectedFile ? 'Archivo seleccionado' : 'Arrastra y suelta tu documento aquí'}
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {selectedFile ? selectedFile.name : 'o haz clic para seleccionar un archivo'}
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Botón de Limpiar */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={reset}
          disabled={isCalculating || isVerifying}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isCalculating || isVerifying ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Información del Archivo */}
      {selectedFile && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '8px',
          border: '1px solid #b8daff'
        }}>
          <strong>📄 Archivo seleccionado:</strong> {selectedFile.name} <br />
          <strong>📏 Tamaño:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
        </div>
      )}

      {/* Resultado de la Verificación */}
      {verificationResult && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: `3px solid ${verificationResult.output.is_valid ? '#28a745' : '#dc3545'}`,
          backgroundColor: verificationResult.output.is_valid ? '#d4edda' : '#f8d7da',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginTop: 0,
            color: verificationResult.output.is_valid ? '#155724' : '#721c24'
          }}>
            {verificationResult.output.is_valid ? '✅ VERIFICACIÓN EXITOSA' : '❌ VERIFICACIÓN FALLIDA'}
          </h3>
          
          <p style={{ 
            fontWeight: 'bold', 
            fontSize: '16px',
            margin: '10px 0',
            color: verificationResult.output.is_valid ? '#155724' : '#721c24'
          }}>
            {verificationResult.output.message}
          </p>
          
          {verificationResult.output.is_valid && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px',
              backgroundColor: '#c3e6cb',
              borderRadius: '6px',
              border: '1px solid #b1dfbb'
            }}>
              <strong>✓ Verificación confiable:</strong> Ejecutada en entorno TEE con attestation proof
            </div>
          )}
        </div>
      )}

      {/* Loading durante procesamiento */}
      {(isCalculating || isVerifying) && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              border: '3px solid #007bff',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '15px'
            }}></div>
            <span style={{ fontWeight: 'bold' }}>
              {isCalculating ? 'Calculando y verificando documento...' : 'Verificando con Livy TEE...'}
            </span>
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
};

export default FileHashCalculator;
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

interface FileHashCalculatorProps {
  onVerificationComplete: (result: VerificationResponse) => void;
}

const FileHashCalculator: React.FC<FileHashCalculatorProps> = ({ onVerificationComplete }) => {
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
      const result = await verifyHashWithLivy(fileHash);
      setVerificationResult(result);
      onVerificationComplete(result);

    } catch (error) {
      console.error('Error procesando el archivo:', error);
      const errorResult = {
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
      };
      setVerificationResult(errorResult);
      onVerificationComplete(errorResult);
    } finally {
      setIsCalculating(false);
      setIsVerifying(false);
    }
  };

  const verifyHashWithLivy = async (fileHash: string): Promise<VerificationResponse> => {
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

      return await response.json();

    } catch (error) {
      console.error('Error verificando el hash:', error);
      throw error;
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setVerificationResult(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onVerificationComplete({
      success: false,
      service: 'document-verifier',
      output: {
        success: false,
        message: '',
        input_hash: '',
        valid_hashes_count: 0,
        is_valid: false
      },
      proofValid: false,
      livyResult: {
        status: 'reset',
        serviceId: '',
        postedToDataAvailability: false
      }
    });
  };

  return (
    <div className="p-5 font-sans max-w-full">
      <h3 className="text-lg font-semibold mb-4">📁 Verificación de Documento</h3>
      
      {/* Dropbox Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          mb-4 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer
          transition-all duration-300 min-h-32 flex flex-col justify-center items-center
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <div className="text-3xl mb-3">📁</div>
        <p className="font-semibold mb-1">
          {selectedFile ? 'Archivo seleccionado' : 'Arrastra y suelta tu documento aquí'}
        </p>
        <p className="text-gray-600 text-sm">
          {selectedFile ? selectedFile.name : 'o haz clic para seleccionar un archivo'}
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Botón de Limpiar */}
      <div className="mb-4">
        <button 
          onClick={reset}
          disabled={isCalculating || isVerifying}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Información del Archivo */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <strong>📄 Archivo:</strong> {selectedFile.name} <br />
          <strong>📏 Tamaño:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
        </div>
      )}

      {/* Resultado de la Verificación */}
      {verificationResult && (
        <div className={`
          p-4 rounded-xl border-2 mb-4
          ${verificationResult.output.is_valid 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
          }
        `}>
          <h4 className="font-semibold mb-2 flex items-center">
            {verificationResult.output.is_valid ? (
              <>✅ VERIFICACIÓN EXITOSA</>
            ) : (
              <>❌ VERIFICACIÓN FALLIDA</>
            )}
          </h4>
          
          <p className="font-medium mb-2">
            {verificationResult.output.message}
          </p>
        </div>
      )}

      {/* Loading durante procesamiento */}
      {(isCalculating || isVerifying) && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center mb-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="font-semibold">
              {isCalculating ? 'Calculando hash...' : 'Verificando con Livy TEE...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileHashCalculator;
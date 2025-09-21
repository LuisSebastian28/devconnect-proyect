import { useState } from "react";
import { X, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "../Button";
import { useAuth } from "../../context/AuthContext";
import { transferService } from "../../services/transferService";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, onTransferSuccess }: TransferModalProps) {
  const { user, wallet } = useAuth();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTransfer = async () => {
    setError("");
    setSuccess("");

    // Validaciones
    if (!recipientAddress.trim()) {
      setError("La dirección del destinatario es requerida");
      return;
    }

    if (!transferService.isValidEthereumAddress(recipientAddress)) {
      setError("La dirección Ethereum no es válida");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    if (wallet && parseFloat(amount) > wallet.balance) {
      setError("Saldo insuficiente para realizar la transferencia");
      return;
    }

    setIsLoading(true);

    try {
      // Llamar al servicio de transferencia
      const result = await transferService.transferETH({
        toAddress: recipientAddress,
        amount: parseFloat(amount)
      });

      if (result.success) {
        setSuccess(`Transferencia exitosa! Hash: ${result.transaction.hash}`);
        console.log("Transferencia completada:", result.transaction);
        
        // Esperar un poco antes de cerrar para que el usuario vea el mensaje
        setTimeout(() => {
          onTransferSuccess();
          handleClose();
        }, 2000);
      } else {
        setError(result.message || "Error en la transferencia");
      }
      
    } catch (err: any) {
      console.error("Error en transferencia:", err);
      setError(err.message || "Error al realizar la transferencia. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress("");
    setAmount("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Transferir ETH</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dirección del destinatario
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Dirección Ethereum del destinatario (0x...)
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cantidad de ETH a transferir
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.001"
                min="0"
                max={wallet?.balance}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2 text-gray-500">ETH</span>
            </div>
            {wallet && (
              <p className="text-sm text-gray-500">
                Saldo disponible: {wallet.balance.toFixed(6)} ETH
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isLoading || !recipientAddress || !amount || !transferService.isValidEthereumAddress(recipientAddress)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transferir
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Cards";
import { Button } from "../Button";
import { Copy, Wallet, RefreshCw, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

interface WalletCardProps {
  onTransferClick: () => void;
  onBalanceRefresh: () => void;
}

export default function WalletCard({ onTransferClick, onBalanceRefresh }: WalletCardProps) {
  const { user, wallet, login } = useAuth();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const copyToClipboard = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshBalance = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      // Hacer login nuevamente para actualizar el balance
      await login(user.phone, user.userType);
      onBalanceRefresh(); // Notificar al componente padre
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!wallet) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Billetera Digital
          </CardTitle>
          <CardDescription>
            No hay información de billetera disponible
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Wallet className="w-5 h-5" />
              Billetera Digital
            </CardTitle>
            <CardDescription>
              Saldo disponible en ETH
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              disabled={refreshing}
              className="text-blue-600 hover:text-blue-800"
              title="Actualizar balance"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-700">
              {wallet.balance.toFixed(6)} ETH
            </p>
            <p className="text-sm text-blue-600 mt-1">Saldo disponible</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dirección de tu billetera:
            </label>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
              <span className="flex-1 text-sm font-mono text-gray-600 truncate">
                {wallet.address}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                disabled={!wallet.address}
                className="text-gray-500 hover:text-gray-700"
                title="Copiar dirección"
              >
                <Copy className="w-4 h-4" />
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <Button
            onClick={onTransferClick}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Transferir ETH
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
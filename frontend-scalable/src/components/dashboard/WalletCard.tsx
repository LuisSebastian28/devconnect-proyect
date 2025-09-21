import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Cards";
import { Button } from "../Button";
import { Copy, Wallet, DollarSign, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function WalletCard() {
  const { user, wallet } = useAuth(); // ← Remueve login de aquí
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
    setRefreshing(true);
    try {
      // Simular actualización de balance (debes implementar esto en tu servicio)
      console.log("Refrescando balance...");
      // Aquí deberías llamar a un servicio específico para actualizar el balance
      // en lugar de hacer login completo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
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
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Wallet className="w-5 h-5" />
              Billetera Digital
            </CardTitle>
            <CardDescription>
              Saldo disponible en USDT
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalance}
            disabled={refreshing}
            className="text-green-600 hover:text-green-800"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-700">
              {wallet.balance.toLocaleString('es-BO', { style: 'currency', currency: 'ETH' })}
            </p>
            <p className="text-sm text-green-600 mt-1">Saldo disponible</p>
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
              >
                <Copy className="w-4 h-4" />
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
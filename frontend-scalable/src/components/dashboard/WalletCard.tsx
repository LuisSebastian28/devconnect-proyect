import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Cards";
import { Button} from "../Button";
import { Copy, Wallet, DollarSign } from "lucide-react";

export default function WalletCard() {
  const [walletAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
  const [balance] = useState(12500.75);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Wallet className="w-5 h-5" />
          Billetera Digital
        </CardTitle>
        <CardDescription>
          Saldo disponible en USDT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-700">
              {balance.toLocaleString('es-BO', { style: 'currency', currency: 'USD' })}
            </p>
            <p className="text-sm text-green-600 mt-1">Saldo disponible</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dirección de tu billetera:
            </label>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
              <span className="flex-1 text-sm font-mono text-gray-600 truncate">
                {walletAddress}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
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
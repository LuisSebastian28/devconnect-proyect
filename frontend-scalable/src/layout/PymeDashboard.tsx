import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards";
import { Button } from "../components/Button";
import { Input } from "../components/ui/Input";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { 
  Copy, 
  DollarSign, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  Percent
} from "lucide-react";

interface Loan {
  id: string;
  amount: number;
  term: number;
  interestRate: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  collateral: string;
}

export default function PymeDashboard() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
  const [balance, setBalance] = useState(12500.75);
  const [copied, setCopied] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);

  // Datos del formulario de préstamo
  const [loanData, setLoanData] = useState({
    amount: "",
    term: "6",
    purpose: "",
    collateral: ""
  });

  // Simular carga de préstamos existentes
  useEffect(() => {
    const mockLoans: Loan[] = [
      {
        id: "LN-001",
        amount: 15000,
        term: 12,
        interestRate: 8.5,
        status: "pending",
        requestDate: "2024-01-15",
        collateral: "Inventario actual"
      },
      {
        id: "LN-002",
        amount: 8000,
        term: 6,
        interestRate: 7.2,
        status: "approved",
        requestDate: "2023-12-10",
        collateral: "Equipos de producción"
      },
      {
        id: "LN-003",
        amount: 25000,
        term: 18,
        interestRate: 9.1,
        status: "rejected",
        requestDate: "2023-11-05",
        collateral: "Propiedad intelectual"
      }
    ];
    setLoans(mockLoans);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLoanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLoan: Loan = {
      id: `LN-${String(loans.length + 1).padStart(3, '0')}`,
      amount: Number(loanData.amount),
      term: Number(loanData.term),
      interestRate: calculateInterestRate(Number(loanData.term)),
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0],
      collateral: loanData.collateral
    };

    setLoans(prev => [newLoan, ...prev]);
    setShowLoanForm(false);
    setLoanData({
      amount: "",
      term: "6",
      purpose: "",
      collateral: ""
    });

    console.log("Nuevo préstamo solicitado:", newLoan);
  };

  const calculateInterestRate = (term: number): number => {
    // Lógica simple para calcular tasa de interés basada en el plazo
    if (term <= 6) return 7.5;
    if (term <= 12) return 8.5;
    if (term <= 18) return 9.5;
    return 10.5;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Pyme</h1>
            </div>
            
            <Button 
              onClick={() => setShowLoanForm(!showLoanForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              {showLoanForm ? "Cancelar" : "Solicitar Préstamo"}
            </Button>
          </div>

          {/* Formulario de préstamo */}
          {showLoanForm && (
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="w-5 h-5" />
                  Solicitar Nuevo Préstamo
                </CardTitle>
                <CardDescription>
                  Complete la información para solicitar financiamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoanSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Monto solicitado (USDT)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          name="amount"
                          type="number"
                          placeholder="10,000"
                          className="pl-10"
                          value={loanData.amount}
                          onChange={handleLoanInputChange}
                          required
                          min="1000"
                          step="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Plazo (meses)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="term"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={loanData.term}
                          onChange={handleLoanInputChange}
                          required
                        >
                          <option value="3">3 meses</option>
                          <option value="6">6 meses</option>
                          <option value="12">12 meses</option>
                          <option value="18">18 meses</option>
                          <option value="24">24 meses</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Garantía o colateral
                    </label>
                    <Input
                      name="collateral"
                      type="text"
                      placeholder="Ej: Inventario, equipos, propiedad intelectual..."
                      value={loanData.collateral}
                      onChange={handleLoanInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Propósito del préstamo
                    </label>
                    <textarea
                      name="purpose"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Describa cómo utilizará los fondos..."
                      value={loanData.purpose}
                      onChange={handleLoanInputChange}
                      required
                    />
                  </div>

                  {loanData.amount && loanData.term && (
                    <div className="p-4 bg-blue-100 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Resumen del préstamo:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Monto:</span>
                          <p className="font-semibold">{Number(loanData.amount).toLocaleString()} USDT</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Plazo:</span>
                          <p className="font-semibold">{loanData.term} meses</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tasa estimada:</span>
                          <p className="font-semibold text-green-600">
                            {calculateInterestRate(Number(loanData.term))}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Pago mensual estimado:</span>
                          <p className="font-semibold">
                            {((Number(loanData.amount) * (1 + calculateInterestRate(Number(loanData.term)) / 100)) / Number(loanData.term)).toLocaleString()} USDT/mes
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Solicitar Préstamo
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Información de la billetera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-600">Préstamos activos</p>
                      <p className="text-xl font-bold text-blue-800">2</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Total pagado</p>
                      <p className="text-xl font-bold text-green-800">$4,200 USDT</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-600">Próximo pago</p>
                      <p className="text-xl font-bold text-purple-800">$1,250 USDT</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Préstamos pendientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="w-5 h-5" />
                Mis Préstamos
              </CardTitle>
              <CardDescription>
                Historial y estado de tus solicitudes de préstamo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes préstamos registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(loan.status)}
                        <div>
                          <h4 className="font-semibold text-gray-800">{loan.id}</h4>
                          <p className="text-sm text-gray-600">
                            {loan.amount.toLocaleString('es-BO', { style: 'currency', currency: 'USD' })} • {loan.term} meses
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">
                            {loan.interestRate}% interés
                          </p>
                          <p className="text-xs text-gray-500">
                            Solicitado: {new Date(loan.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
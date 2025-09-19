import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Cards";
import { Button } from "../Button";
import { Input } from "../ui/Input";
import type { Loan, LoanFormData } from "../../types/loan";
import { DollarSign, Calendar, FileText, TrendingUp, X } from "lucide-react";

interface LoanFormProps {
  onSubmit: (loan: Loan) => void;
  onCancel: () => void;
}

export default function LoanForm({ onSubmit, onCancel }: LoanFormProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    amount: "",
    term: "6",
    purpose: "",
    collateral: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateInterestRate = (term: number): number => {
    if (term <= 6) return 7.5;
    if (term <= 12) return 8.5;
    if (term <= 18) return 9.5;
    return 10.5;
  };

  const calculateMonthlyPayment = (amount: number, term: number, interestRate: number): number => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return Number(payment.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(formData.amount);
    const term = Number(formData.term);
    const interestRate = calculateInterestRate(term);
    const monthlyPayment = calculateMonthlyPayment(amount, term, interestRate);

    const newLoan: Loan = {
      id: `LN-${Date.now()}`,
      amount,
      term,
      interestRate,
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0],
      collateral: formData.collateral,
      purpose: formData.purpose,
      monthlyPayment
    };

    onSubmit(newLoan);
  };

  const interestRate = calculateInterestRate(Number(formData.term));
  const monthlyPayment = formData.amount ? 
    calculateMonthlyPayment(Number(formData.amount), Number(formData.term), interestRate) : 0;

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50 relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileText className="w-5 h-5" />
          Solicitar Nuevo Préstamo
        </CardTitle>
        <CardDescription>
          Complete la información para solicitar financiamiento
        </CardDescription>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={formData.amount}
                  onChange={handleInputChange}
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
                  value={formData.term}
                  onChange={handleInputChange}
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
              value={formData.collateral}
              onChange={handleInputChange}
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
              value={formData.purpose}
              onChange={handleInputChange}
              required
            />
          </div>

          {formData.amount && formData.term && (
            <div className="p-4 bg-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Resumen del préstamo:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monto:</span>
                  <p className="font-semibold">{Number(formData.amount).toLocaleString()} USDT</p>
                </div>
                <div>
                  <span className="text-gray-600">Plazo:</span>
                  <p className="font-semibold">{formData.term} meses</p>
                </div>
                <div>
                  <span className="text-gray-600">Tasa de interés:</span>
                  <p className="font-semibold text-green-600">{interestRate}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Pago mensual:</span>
                  <p className="font-semibold">{monthlyPayment.toLocaleString()} USDT/mes</p>
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
  );
}
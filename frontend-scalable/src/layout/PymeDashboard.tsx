import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import WalletCard from "../components/dashboard/WalletCard";
import LoanForm from "../components/dashboard/LoanForm";
import LoansList from "../components/dashboard/LoansList";
import LoanDetailsModal from "../components/dashboard/LoanDetailsModal";
import type{ Loan } from "../types/loan";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../components/Button";

export default function PymeDashboard() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

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
        collateral: "Inventario actual",
        purpose: "Expansión de inventario para temporada alta",
        monthlyPayment: 1354.17
      }
    ];
    setLoans(mockLoans);
  }, []);

  const handleNewLoan = (newLoan: Loan) => {
    setLoans(prev => [newLoan, ...prev]);
    setShowLoanForm(false);
  };

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const closeLoanDetails = () => {
    setSelectedLoan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
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
            <LoanForm 
              onSubmit={handleNewLoan}
              onCancel={() => setShowLoanForm(false)}
            />
          )}

          {/* Información de la billetera */}
          <div className="mb-8">
            <WalletCard />
          </div>

          {/* Lista de préstamos */}
          <LoansList 
            loans={loans}
            onLoanClick={handleLoanClick}
          />

          {/* Modal de detalles del préstamo */}
          {selectedLoan && (
            <LoanDetailsModal 
              loan={selectedLoan}
              onClose={closeLoanDetails}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
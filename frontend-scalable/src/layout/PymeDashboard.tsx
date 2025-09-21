import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import WalletCard from "../components/dashboard/WalletCard";
import LoanForm from "../components/dashboard/LoanForm";
import LoansList from "../components/dashboard/LoansList";
import LoanDetailsModal from "../components/dashboard/LoanDetailsModal";
import TransferModal from "../components/dashboard/TransferModal";
import type { Loan } from "../types/loan";
import { ArrowLeft, Plus, User,RefreshCw } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function PymeDashboard() {
  const navigate = useNavigate();
  const { user, wallet, isLoading, login } = useAuth();
  
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log('PymeDashboard rendering - User:', user, 'Wallet:', wallet, 'Loading:', isLoading);

  // ✅ Enhanced authentication check
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
      } else if (user.userType !== 'entrepreneur') {
        console.log('Wrong user type for Pyme dashboard, redirecting...');
        if (user.userType === 'investor') {
          navigate('/investor-dashboard');
        } else {
          navigate('/login');
        }
      } else {
        console.log('Entrepreneur user authenticated successfully');
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user?.userType === 'entrepreneur') {
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
    }
  }, [user]);

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

  const handleTransferSuccess = () => {
    // Forzar actualización del balance después de transferencia
    setRefreshTrigger(prev => prev + 1);
    console.log("Transferencia exitosa, actualizando balance...");
  };

  const handleBalanceRefresh = () => {
    console.log("Balance actualizado manualmente");
  };

  const handleRefreshBalance = async () => {
    if (!user) return;
    
    try {
      // Hacer login nuevamente para actualizar el balance
      await login(user.phone, user.userType);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'entrepreneur') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Pyme</h1>
                <p className="text-gray-600 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.fullName} {user.company && `- ${user.company}`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleRefreshBalance}
                variant="outline"
                className="flex items-center gap-2"
                title="Actualizar balance"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
              <Button 
                onClick={() => setShowLoanForm(!showLoanForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                {showLoanForm ? "Cancelar" : "Solicitar Préstamo"}
              </Button>
            </div>
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
            <WalletCard 
              onTransferClick={() => setShowTransferModal(true)}
              onBalanceRefresh={handleBalanceRefresh}
              key={refreshTrigger}
            />
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

          {/* Modal de Transferencia */}
          <TransferModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            onTransferSuccess={handleTransferSuccess}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
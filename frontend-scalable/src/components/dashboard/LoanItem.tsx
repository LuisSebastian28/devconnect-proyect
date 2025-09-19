import type { Loan } from "../../types/loan";
import { getStatusColor, getStatusText, getStatusIcon } from "../../utils/loanUtils";
import type { LucideIcon } from "lucide-react";

interface LoanItemProps {
  loan: Loan;
  onClick: () => void;
}

export default function LoanItem({ loan, onClick }: LoanItemProps) {
  const StatusIcon: LucideIcon = getStatusIcon(loan.status);
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4">
        <StatusIcon className="w-5 h-5" 
          color={loan.status === "approved" ? "green" : loan.status === "rejected" ? "red" : "orange"} 
        />
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
  );
}
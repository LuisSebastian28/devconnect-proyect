import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Cards";
import type { Loan } from "../../types/loan";
import { Clock, FileText } from "lucide-react";
import LoanItem from "./LoanItem";

interface LoansListProps {
  loans: Loan[];
  onLoanClick: (loan: Loan) => void;
}

export default function LoansList({ loans, onLoanClick }: LoansListProps) {
  if (loans.length === 0) {
    return (
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
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tienes préstamos registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanItem
              key={loan.id}
              loan={loan}
              onClick={() => onLoanClick(loan)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
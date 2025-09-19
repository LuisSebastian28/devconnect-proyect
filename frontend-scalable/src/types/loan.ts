export interface Loan {
  id: string;
  amount: number;
  term: number;
  interestRate: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  collateral: string;
  purpose: string;
  monthlyPayment: number;
}

export interface LoanFormData {
  amount: string;
  term: string;
  purpose: string;
  collateral: string;
}
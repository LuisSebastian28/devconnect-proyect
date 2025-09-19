import type { Loan } from "../../types/loan";
import { getStatusColor, getStatusText } from "../../utils/loanUtils";
import { X, Calendar, DollarSign, Percent, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface LoanDetailsModalProps {
  loan: Loan;
  onClose: () => void;
}

export default function LoanDetailsModal({ loan, onClose }: LoanDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Detalles del Préstamo</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header con estado */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
              {getStatusText(loan.status)}
            </span>
            <span className="text-sm text-gray-500">ID: {loan.id}</span>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Monto</span>
              </div>
              <p className="font-semibold text-lg">
                {loan.amount.toLocaleString('es-BO', { style: 'currency', currency: 'USD' })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Plazo</span>
              </div>
              <p className="font-semibold text-lg">{loan.term} meses</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Percent className="w-4 h-4" />
                <span className="text-sm">Tasa de interés</span>
              </div>
              <p className="font-semibold text-lg text-green-600">{loan.interestRate}%</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Pago mensual</span>
              </div>
              <p className="font-semibold text-lg">{loan.monthlyPayment.toLocaleString()} USDT</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Propósito del préstamo
              </h3>
              <p className="text-gray-600 text-sm">{loan.purpose}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Garantía
              </h3>
              <p className="text-gray-600 text-sm">{loan.collateral}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de solicitud
              </h3>
              <p className="text-gray-600 text-sm">
                {new Date(loan.requestDate).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Acciones según el estado */}
          {loan.status === "pending" && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">En revisión</span>
              </div>
              <p className="text-sm text-yellow-700">
                Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando haya una actualización.
              </p>
            </div>
          )}

          {loan.status === "approved" && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">¡Aprobado!</span>
              </div>
              <p className="text-sm text-green-700">
                Tu préstamo ha sido aprobado. Los fondos serán transferidos a tu billetera en las próximas 24 horas.
              </p>
            </div>
          )}

          {loan.status === "rejected" && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <XCircle className="w-4 h-4" />
                <span className="font-semibold">Rechazado</span>
              </div>
              <p className="text-sm text-red-700">
                Lamentablemente tu solicitud no pudo ser aprobada en este momento. Puedes intentar con un monto menor o contactar a soporte.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
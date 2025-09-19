import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const getStatusIcon = (status: string): LucideIcon => {
  switch (status) {
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    default:
      return Clock;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case "approved":
      return "Aprobado";
    case "rejected":
      return "Rechazado";
    default:
      return "Pendiente";
  }
};
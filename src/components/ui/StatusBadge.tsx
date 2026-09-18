import React from "react";
import { Badge } from "./Badge";
import { CheckCircle2, Clock, Truck, AlertTriangle, RotateCcw, ShieldCheck, XCircle } from "lucide-react";

export type ShipmentStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "UNDELIVERED"
  | "RETURNED"
  | "SETTLED";

interface StatusBadgeProps {
  status: ShipmentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalizedStatus = status.toUpperCase() as ShipmentStatus;

  switch (normalizedStatus) {
    case "DELIVERED":
      return (
        <Badge variant="success" className={`gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
        </Badge>
      );
    case "SETTLED":
      return (
        <Badge variant="success" className={`gap-1.5 py-1 px-2.5 bg-teal-500/10 text-teal-700 border-teal-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Settled
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="warning" className={`gap-1.5 py-1 px-2.5 bg-amber-500/10 text-amber-700 border-amber-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
        </Badge>
      );
    case "RETURNED":
      return (
        <Badge variant="warning" className={`gap-1.5 py-1 px-2.5 bg-rose-500/10 text-rose-700 border-rose-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Returned
        </Badge>
      );
    case "UNDELIVERED":
      return (
        <Badge variant="error" className={`gap-1.5 py-1 px-2.5 bg-orange-500/10 text-orange-700 border-orange-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <XCircle className="w-3.5 h-3.5 text-orange-600" /> Undelivered
        </Badge>
      );
    case "PICKED_UP":
      return (
        <Badge variant="info" className={`gap-1.5 py-1 px-2.5 bg-sky-500/10 text-sky-700 border-sky-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <Truck className="w-3.5 h-3.5 text-sky-600" /> Picked Up
        </Badge>
      );
    case "IN_TRANSIT":
      return (
        <Badge variant="info" className={`gap-1.5 py-1 px-2.5 bg-blue-500/10 text-blue-700 border-blue-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <Truck className="w-3.5 h-3.5 text-blue-600" /> In Transit
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={`gap-1.5 py-1 px-2.5 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5" /> {status}
        </Badge>
      );
  }
};

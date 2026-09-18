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
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
        </Badge>
      );
    case "SETTLED":
      return (
        <Badge variant="success" className={className}>
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Settled
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="warning" className={className}>
          <Clock className="w-3.5 h-3.5 mr-1" /> Pending
        </Badge>
      );
    case "RETURNED":
      return (
        <Badge variant="warning" className={className}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Returned
        </Badge>
      );
    case "UNDELIVERED":
      return (
        <Badge variant="error" className={className}>
          <XCircle className="w-3.5 h-3.5 mr-1" /> Undelivered
        </Badge>
      );
    case "PICKED_UP":
      return (
        <Badge variant="info" className={className}>
          <Truck className="w-3.5 h-3.5 mr-1" /> Picked Up
        </Badge>
      );
    case "IN_TRANSIT":
      return (
        <Badge variant="info" className={className}>
          <Truck className="w-3.5 h-3.5 mr-1" /> In Transit
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {status}
        </Badge>
      );
  }
};

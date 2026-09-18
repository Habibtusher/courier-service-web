import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge, ShipmentStatus } from "@/components/ui/StatusBadge";
import { Search, MapPin, User, CheckCircle2, Clock, Truck, AlertCircle, Package } from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

interface TrackingLog {
  id: string;
  status: ShipmentStatus;
  location: string;
  notes?: string;
  timestamp: string;
}

interface ParcelDetail {
  id: string;
  cnNumber: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  weight: number;
  qty?: number;
  deliveryFee: number;
  codAmount: number;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  merchant?: { businessName: string };
  originBranch?: { name: string; code: string };
  destinationBranch?: { name: string; code: string };
  trackingLogs: TrackingLog[];
}

export const Tracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [parcel, setParcel] = useState<ParcelDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tn = searchParams.get("tn") || searchParams.get("cn");
    if (tn) {
      setTrackingInput(tn);
      fetchTracking(tn);
    } else {
      // Default initial lookup
      fetchTracking("MSL20260918000001");
    }
  }, [searchParams]);

  const fetchTracking = async (numberToSearch: string) => {
    if (!numberToSearch.trim()) return;
    try {
      setLoading(true);
      setError(null);
      // Public endpoint (unprotected)
      const res: any = await api.get(`/parcels/track/${numberToSearch.trim()}`);
      if (res.success && res.data) {
        setParcel(res.data);
      }
    } catch (err: any) {
      setParcel(null);
      setError(err.message || `No active shipment found matching '${numberToSearch}'`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full border border-sky-200">
          Public Consignment Portal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Shipment</h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Enter your Consignment Number (CN Number e.g. <span className="font-mono font-bold">MSL20260918000001</span>) for instant real-time dispatch timeline updates.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Enter CN Number (e.g. MSL20260918000001)"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="pl-11 h-12 text-base font-mono border-slate-300 shadow-sm rounded-xl focus-visible:ring-primary uppercase"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 rounded-xl font-bold gap-2 shadow-md bg-primary">
            {loading ? "Searching..." : "Track Consignment"}
          </Button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 p-6 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Consignment Not Found</h3>
          <p className="text-sm mt-1">{error}</p>
        </Card>
      )}

      {/* Parcel Detail Display */}
      {parcel && (
        <div className="space-y-6">
          {/* Main Info Card */}
          <Card className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-primary text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
              <div>
                <div className="text-xs uppercase tracking-wider text-sky-300 font-semibold mb-1">CONSIGNMENT NUMBER (CN)</div>
                <div className="text-2xl font-mono font-extrabold tracking-wide">{parcel.cnNumber || parcel.trackingNumber}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={parcel.status} className="text-sm px-4 py-1.5 shadow-md" />
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                {/* Sender */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <User className="w-4 h-4 text-primary" /> Sender Information
                  </div>
                  <div className="font-bold text-slate-800 text-base">{parcel.merchant?.businessName || parcel.senderName}</div>
                  <div className="text-xs text-slate-600">{parcel.senderPhone}</div>
                  <div className="text-xs text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{parcel.senderAddress}</span>
                  </div>
                </div>

                {/* Recipient */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <User className="w-4 h-4 text-emerald-600" /> Recipient Details
                  </div>
                  <div className="font-bold text-slate-800 text-base">{parcel.recipientName}</div>
                  <div className="text-xs text-slate-600">{parcel.recipientPhone}</div>
                  <div className="text-xs text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{parcel.recipientAddress} ({parcel.district})</span>
                  </div>
                </div>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 font-medium">Weight / Qty</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{parcel.weight} kg ({parcel.qty || 1} pcs)</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 font-medium">COD Collectible</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">৳{parcel.codAmount.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 font-medium">Delivery Fee</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">৳{parcel.deliveryFee.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 font-medium">Booked Date</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{formatDate(parcel.createdAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="bg-white border shadow-sm rounded-2xl">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Vertical Consignment Timeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Step-by-step hub dispatch updates and checkpoint timestamps
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {parcel.trackingLogs && parcel.trackingLogs.length > 0 ? (
                  parcel.trackingLogs.map((log, idx) => (
                    <div key={log.id || idx} className="relative pl-6 group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center shadow-md group-first:bg-emerald-600 group-first:ring-4 group-first:ring-emerald-100">
                        {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <StatusBadge status={log.status} />
                          <span className="text-xs text-slate-400 font-mono">{formatDate(log.timestamp)}</span>
                        </div>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-sky-600" /> {log.location}
                        </div>
                        {log.notes && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-200/60">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 text-sm py-4">No tracking logs recorded yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

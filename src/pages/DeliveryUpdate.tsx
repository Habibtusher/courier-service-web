import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import {
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bike,
  UserCheck,
  AlertTriangle,
  PackageCheck,
  Building2,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface RiderOption {
  id: string;
  name: string;
  mobile: string;
  vehicleType: string;
  status: string;
}

interface TrackingHistoryItem {
  id: string;
  status: string;
  location: string;
  notes?: string;
  reason?: string;
  timestamp: string;
}

interface ParcelDetail {
  id: string;
  cnNumber: string;
  merchantId: string;
  merchant?: {
    businessName: string;
    ownerName: string;
    mobile: string;
  };
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  weight: number;
  qty: number;
  deliveryFee: number;
  codAmount: number;
  status: string;
  reason?: string;
  riderId?: string;
  rider?: {
    id: string;
    name: string;
    mobile: string;
  };
  trackingHistory?: TrackingHistoryItem[];
  createdAt: string;
}

export const DeliveryUpdate: React.FC = () => {
  const [cnSearch, setCnSearch] = useState('');
  const [parcel, setParcel] = useState<ParcelDetail | null>(null);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rider assignment state
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [assigningRider, setAssigningRider] = useState(false);

  // Exception Dialog Modal State
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'UNDELIVERED' | 'RETURNED'>('UNDELIVERED');
  const [reason, setReason] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Delivered Confirmation State
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const res: any = await api.get('/riders');
      if (res.success && Array.isArray(res.data)) {
        setRiders(res.data.filter((r: RiderOption) => r.status === 'ACTIVE'));
      }
    } catch (_err) {}
  };

  const handleSearchParcel = async (cnToFetch?: string) => {
    const code = cnToFetch || cnSearch.trim();
    if (!code) return;

    try {
      setLoading(true);
      setSearchError(null);
      setActionSuccess(null);
      const res: any = await api.get(`/parcels/track/${code}`);
      if (res.success && res.data) {
        setParcel(res.data);
        setSelectedRiderId(res.data.riderId || '');
        setDeliveryLocation(res.data.recipientAddress || res.data.district || 'Customer Destination');
      } else {
        setParcel(null);
        setSearchError(`No parcel found for CN: ${code}`);
      }
    } catch (err: any) {
      setParcel(null);
      setSearchError(err.message || `Consignment "${code}" not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRider = async () => {
    if (!parcel || !selectedRiderId) {
      toast.error('Please select a rider to assign.');
      return;
    }

    try {
      setAssigningRider(true);
      const res: any = await api.put(`/parcels/${parcel.cnNumber}/assign-rider`, {
        riderId: selectedRiderId,
      });
      if (res.success) {
        toast.success(`Rider successfully assigned to parcel ${parcel.cnNumber}`);
        setActionSuccess(`Rider successfully assigned to parcel ${parcel.cnNumber}`);
        handleSearchParcel(parcel.cnNumber);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign rider');
    } finally {
      setAssigningRider(false);
    }
  };

  const handleOpenExceptionDialog = (statusType: 'UNDELIVERED' | 'RETURNED') => {
    setTargetStatus(statusType);
    setReason(
      statusType === 'UNDELIVERED'
        ? 'Customer Not Available'
        : 'Address Not Found'
    );
    setLocationStr(parcel?.district ? `${parcel.district} Hub` : 'Delivery Hub');
    setNotes('');
    setExceptionDialogOpen(true);
  };

  const handleConfirmExceptionStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel) return;

    if (!reason) {
      toast.error('Mandatory Reason is required for Undelivered / Returned status.');
      return;
    }

    try {
      setSubmittingStatus(true);
      const res: any = await api.put(`/parcels/${parcel.cnNumber}/status`, {
        status: targetStatus,
        location: locationStr || 'Hub Location',
        reason,
        notes,
        riderId: parcel.riderId,
      });

      if (res.success) {
        toast.success(`Status updated to ${targetStatus}. Exception Reason "${reason}" recorded.`);
        setExceptionDialogOpen(false);
        setActionSuccess(
          `Status updated to ${targetStatus}. Exception Reason "${reason}" recorded.`
        );
        handleSearchParcel(parcel.cnNumber);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!parcel) return;

    try {
      setSubmittingStatus(true);
      const res: any = await api.put(`/parcels/${parcel.cnNumber}/status`, {
        status: 'DELIVERED',
        location: deliveryLocation || parcel.recipientAddress || 'Recipient Address',
        notes: `Delivered successfully. COD collected: ৳${parcel.codAmount.toFixed(2)}`,
        riderId: parcel.riderId,
      });

      if (res.success) {
        toast.success(`Parcel ${parcel.cnNumber} marked as DELIVERED! Automatic COD Transaction generated.`);
        setDeliverDialogOpen(false);
        setActionSuccess(
          `Parcel ${parcel.cnNumber} marked as DELIVERED! Automatic COD Transaction generated for ৳${parcel.codAmount.toFixed(
            2
          )}.`
        );
        handleSearchParcel(parcel.cnNumber);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as delivered');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" className="text-xs px-3 py-1 bg-emerald-600 text-white font-bold">DELIVERED</Badge>;
      case 'UNDELIVERED':
        return <Badge variant="warning" className="text-xs px-3 py-1 bg-amber-600 text-white font-bold">UNDELIVERED</Badge>;
      case 'RETURNED':
        return <Badge variant="destructive" className="text-xs px-3 py-1 bg-red-600 text-white font-bold">RETURNED</Badge>;
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return <Badge variant="info" className="text-xs px-3 py-1 bg-sky-600 text-white font-bold">{status.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs px-3 py-1 bg-slate-700 text-white font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" /> Delivery Update Workspace
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Scan or search a CN consignment number to update last-mile delivery status, assign riders, and record exception reasons.
        </p>
      </div>

      {/* CN Scanner / Search Bar */}
      <Card className="bg-white border shadow-sm p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchParcel();
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Scan or enter Consignment Number (e.g. MSL-20260917-0001)..."
              value={cnSearch}
              onChange={(e) => setCnSearch(e.target.value)}
              className="pl-11 h-11 text-sm font-mono uppercase font-bold tracking-wide"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-primary text-white font-semibold text-sm gap-2"
          >
            {loading ? 'Searching...' : 'Search CN'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {searchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Active Parcel Details & Operations Card */}
      {parcel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Consignment Overview & Rider Assignment */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      CONSIGNMENT DETAILS
                    </span>
                    <CardTitle className="text-xl font-mono text-slate-900 font-extrabold tracking-tight mt-0.5">
                      {parcel.cnNumber}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Booked on {new Date(parcel.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(parcel.status)}
                    {parcel.reason && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Reason: {parcel.reason}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-inner">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">COD Collection</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      ৳{parcel.codAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Delivery Fee</div>
                    <div className="text-lg font-bold text-sky-400 font-mono">
                      ৳{parcel.deliveryFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Weight / Qty</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {parcel.weight} kg ({parcel.qty} pcs)
                    </div>
                  </div>
                </div>

                {/* Sender & Recipient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> Merchant & Sender
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      {parcel.merchant?.businessName || parcel.senderName}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {parcel.senderPhone || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{parcel.senderAddress || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                    <div className="text-xs font-bold uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Recipient Destination
                    </div>
                    <div className="font-bold text-sm text-slate-900">{parcel.recipientName}</div>
                    <div className="text-xs text-slate-700 flex items-center gap-1 font-semibold">
                      <Phone className="w-3 h-3 text-blue-500" /> {parcel.recipientPhone}
                    </div>
                    <div className="text-xs text-slate-700 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{parcel.recipientAddress}, {parcel.district}</span>
                    </div>
                  </div>
                </div>

                {/* Rider Assignment Section */}
                <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Bike className="w-4 h-4 text-primary" /> Assign Delivery Rider
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                    <select
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="flex-1 h-10 rounded-md border border-input bg-white px-3 py-2 text-sm font-semibold"
                    >
                      <option value="">Select Delivery Rider...</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.mobile}) - {r.vehicleType}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={handleAssignRider}
                      disabled={assigningRider || !selectedRiderId}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-medium gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      {assigningRider ? 'Assigning...' : 'Assign Rider'}
                    </Button>
                  </div>
                  {parcel.rider && (
                    <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Currently assigned to: <strong>{parcel.rider.name}</strong> ({parcel.rider.mobile})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking History Timeline */}
            {parcel.trackingHistory && parcel.trackingHistory.length > 0 && (
              <Card className="bg-white border shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Consignment Audit Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {parcel.trackingHistory.map((h) => (
                      <div key={h.id} className="relative group">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-sm text-slate-900">
                            {h.status.replace('_', ' ')}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium">{h.location}</div>
                        {h.reason && (
                          <div className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-1 rounded mt-1 inline-block">
                            Reason: {h.reason}
                          </div>
                        )}
                        {h.notes && (
                          <div className="text-xs text-slate-500 italic mt-0.5">{h.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Quick Status Update Operations */}
          <div className="space-y-6">
            <Card className="bg-white border shadow-sm sticky top-24">
              <CardHeader className="bg-slate-950 text-white rounded-t-xl pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-sky-400" /> Delivery Operations Action
                </CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Update parcel state & process automatic financial logs.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Mark Delivered Button */}
                <Button
                  size="lg"
                  onClick={() => setDeliverDialogOpen(true)}
                  disabled={parcel.status === 'DELIVERED'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-base shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Mark Delivered (Collect ৳{parcel.codAmount.toFixed(2)})
                </Button>

                {/* Exception Status Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenExceptionDialog('UNDELIVERED')}
                    disabled={parcel.status === 'DELIVERED'}
                    className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold h-12 text-xs flex flex-col items-center justify-center gap-0.5"
                  >
                    <XCircle className="w-4 h-4 text-amber-600" />
                    Mark Undelivered
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleOpenExceptionDialog('RETURNED')}
                    disabled={parcel.status === 'DELIVERED'}
                    className="border-red-300 bg-red-50 hover:bg-red-100 text-red-900 font-bold h-12 text-xs flex flex-col items-center justify-center gap-0.5"
                  >
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    Mark Returned
                  </Button>
                </div>

                <div className="p-3 bg-slate-50 border rounded-lg text-[11px] text-slate-500 leading-snug">
                  <strong>Note:</strong> Marking as <strong>DELIVERED</strong> will automatically record an entry in the COD Transaction register for settlement. Marking as <strong>UNDELIVERED</strong> or <strong>RETURNED</strong> requires a mandatory reason.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Deliver Confirmation Modal */}
      <Dialog
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        title="Confirm Parcel Delivery"
        description={`Confirm physical delivery and COD collection for consignment ${parcel?.cnNumber}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="text-xs text-emerald-800 font-bold uppercase">COD Amount to Collect</div>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              ৳{parcel?.codAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Delivery Location / Address</label>
            <Input
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="mt-1 text-xs"
              placeholder="e.g. Customer Home Address / Front Desk"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDeliverDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelivery}
              disabled={submittingStatus}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {submittingStatus ? 'Updating...' : 'Confirm Delivery & Collect COD'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Mandatory Exception Reason Modal (Undelivered / Returned) */}
      <Dialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
        title={`Record Exception Reason (${targetStatus})`}
        description="Mandatory exception reason logging is enforced for undelivered and returned parcels."
      >
        <form onSubmit={handleConfirmExceptionStatus} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Mandatory Exception Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 rounded-md border border-amber-300 bg-amber-50/50 px-3 py-2 text-sm font-bold text-slate-900"
              required
            >
              {targetStatus === 'UNDELIVERED' ? (
                <>
                  <option value="Customer Not Available">Customer Not Available</option>
                  <option value="Mobile Off / Unreachable">Mobile Off / Unreachable</option>
                  <option value="Wrong Address / Phone">Wrong Address / Phone</option>
                  <option value="Customer Refused Parcel">Customer Refused Parcel</option>
                  <option value="Rescheduled by Customer">Rescheduled by Customer</option>
                  <option value="Rider Unable to Locate Address">Rider Unable to Locate Address</option>
                </>
              ) : (
                <>
                  <option value="Address Not Found">Address Not Found</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Customer Cancelled Order">Customer Cancelled Order</option>
                  <option value="Failed 3 Delivery Attempts">Failed 3 Delivery Attempts</option>
                  <option value="Returned by Merchant Request">Returned by Merchant Request</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Hub / Current Location</label>
            <Input
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
              className="mt-1 text-xs"
              placeholder="e.g. Downtown Branch Hub"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Additional Remarks / Operator Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs mt-1"
              placeholder="Specify rider notes or call response details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setExceptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submittingStatus}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              {submittingStatus ? 'Submitting...' : `Submit ${targetStatus} Status`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default DeliveryUpdate;

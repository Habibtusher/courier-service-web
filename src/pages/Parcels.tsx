import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge, ShipmentStatus } from "@/components/ui/StatusBadge";
import { PlusCircle, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, PackageCheck, Send } from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Parcel {
  id: string;
  cnNumber?: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  weight: number;
  deliveryFee: number;
  status: ShipmentStatus;
  createdAt: string;
}

export const Parcels: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Form State
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    weight: "1.5",
    deliveryFee: "15.00",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Status Update state
  const [selectedParcelForStatus, setSelectedParcelForStatus] = useState<Parcel | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<ShipmentStatus>("IN_TRANSIT");
  const [updateLocationVal, setUpdateLocationVal] = useState<string>("Regional Sort Facility");
  const [updateNotesVal, setUpdateNotesVal] = useState<string>("");
  const [updateReasonVal, setUpdateReasonVal] = useState<string>("Customer Not Available");

  useEffect(() => {
    fetchParcels();
    if (searchParams.get("action") === "new") {
      setShowCreateModal(true);
    }
  }, [searchParams, currentPage, pageSize, filterStatus, searchQuery]);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus && filterStatus !== "ALL") params.append("status", filterStatus);

      const res: any = await api.get(`/parcels?${params.toString()}`);
      if (res.success && res.data) {
        if (res.data.items && Array.isArray(res.data.items)) {
          setParcels(res.data.items);
          setTotalItems(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        } else if (Array.isArray(res.data)) {
          setParcels(res.data);
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load parcels from backend API");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.senderName || !formData.recipientName) {
      setFormError("Sender Name and Recipient Name are required");
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await api.post("/parcels", {
        ...formData,
        weight: parseFloat(formData.weight),
        deliveryFee: parseFloat(formData.deliveryFee),
      });

      if (res.success) {
        setFormSuccess(`Parcel created! Tracking code: ${res.data.trackingNumber}`);
        fetchParcels();
        setFormData({
          senderName: "",
          senderPhone: "",
          senderAddress: "",
          recipientName: "",
          recipientPhone: "",
          recipientAddress: "",
          weight: "1.5",
          deliveryFee: "15.00",
        });
        setTimeout(() => {
          setShowCreateModal(false);
          setFormSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create parcel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelForStatus) return;

    if ((updateStatusVal === "UNDELIVERED" || updateStatusVal === "RETURNED") && !updateReasonVal.trim()) {
      toast.error(`Reason is mandatory when marking a parcel as ${updateStatusVal}`);
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await api.put(`/parcels/${selectedParcelForStatus.cnNumber || selectedParcelForStatus.trackingNumber}/status`, {
        status: updateStatusVal,
        location: updateLocationVal,
        notes: updateNotesVal,
        reason: updateReasonVal,
      });

      if (res.success) {
        toast.success(`Parcel status updated to ${updateStatusVal}`);
        fetchParcels();
        setSelectedParcelForStatus(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update parcel status");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParcels = parcels.filter((p) => {
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchesSearch =
      p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parcel Management System</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Register new consignments, monitor dispatch logs, and update status settlements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchParcels} className="gap-1 border-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link to="/booking/new">
            <Button
              size="sm"
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create New Parcel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tracking, sender, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 text-xs rounded-md border border-input bg-background px-3 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered (Success)</option>
              <option value="SETTLED">Settled (Success)</option>
              <option value="IN_TRANSIT">In Transit (Info)</option>
              <option value="PICKED_UP">Picked Up (Info)</option>
              <option value="PENDING">Pending (Warning)</option>
              <option value="RETURNED">Returned (Warning)</option>
              <option value="UNDELIVERED">Undelivered (Error)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Parcels Table */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading parcels...</div>
          ) : error ? (
            <div className="p-6 text-center bg-red-50 text-red-600 text-sm">{error}</div>
          ) : parcels.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No matching parcels found for filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Tracking #</th>
                    <th className="px-6 py-3.5 font-semibold">Sender Details</th>
                    <th className="px-6 py-3.5 font-semibold">Recipient Details</th>
                    <th className="px-6 py-3.5 font-semibold">Weight / Fee</th>
                    <th className="px-6 py-3.5 font-semibold">Current Status</th>
                    <th className="px-6 py-3.5 font-semibold">Date</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                          {parcel.cnNumber || parcel.trackingNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{parcel.senderName}</div>
                          <div className="text-xs text-slate-500">{parcel.senderPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{parcel.recipientName}</div>
                          <div className="text-xs text-slate-500">{parcel.recipientPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">{parcel.weight} kg</div>
                          <div className="text-xs font-semibold text-emerald-600">৳{parcel.deliveryFee.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={parcel.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{formatDate(parcel.createdAt)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedParcelForStatus(parcel);
                              setUpdateStatusVal(parcel.status);
                            }}
                            className="h-8 text-xs border-slate-300"
                          >
                            Update Status
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Parcel Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Register New Consignment"
        description="Generate tracking code and dispatch label"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-200">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
              <h4 className="text-xs font-bold uppercase text-slate-600">Sender Details</h4>
              <div>
                <label className="text-xs text-slate-600 font-medium">Name *</label>
                <Input
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="e.g. Alice Smith"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Phone</label>
                <Input
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  placeholder="+1 555-0100"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Address</label>
                <Input
                  value={formData.senderAddress}
                  onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                  placeholder="Street, City, State"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
              <h4 className="text-xs font-bold uppercase text-slate-600">Recipient Details</h4>
              <div>
                <label className="text-xs text-slate-600 font-medium">Name *</label>
                <Input
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="e.g. Bob Johnson"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Phone</label>
                <Input
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="+1 555-0199"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Address</label>
                <Input
                  value={formData.recipientAddress}
                  onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                  placeholder="Destination Street, City"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 font-medium">Package Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium">Delivery Fee (৳)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-white font-semibold">
              {submitting ? "Registering..." : "Submit Consignment"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog
        open={!!selectedParcelForStatus}
        onOpenChange={(open) => {
          if (!open) setSelectedParcelForStatus(null);
        }}
        title="Update Status Checkpoint"
        description={selectedParcelForStatus?.trackingNumber || ""}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">New Status</label>
            <select
              value={updateStatusVal}
              onChange={(e) => setUpdateStatusVal(e.target.value as ShipmentStatus)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus:ring-primary"
            >
              <option value="DELIVERED">Delivered (Success - Green)</option>
              <option value="SETTLED">Settled (Success - Green)</option>
              <option value="IN_TRANSIT">In Transit (Info - Bright Blue)</option>
              <option value="PICKED_UP">Picked Up (Info - Bright Blue)</option>
              <option value="PENDING">Pending (Warning - Yellow/Orange)</option>
              <option value="RETURNED">Returned (Warning - Yellow/Orange)</option>
              <option value="UNDELIVERED">Undelivered (Error - Red)</option>
            </select>
          </div>

          {(updateStatusVal === "UNDELIVERED" || updateStatusVal === "RETURNED") && (
            <div>
              <label className="text-xs text-amber-800 font-bold block mb-1">
                Reason * <span className="text-red-500 font-normal">(Mandatory for {updateStatusVal})</span>
              </label>
              <select
                value={updateReasonVal}
                onChange={(e) => setUpdateReasonVal(e.target.value)}
                className="w-full h-10 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 focus:ring-amber-500"
                required
              >
                <option value="Customer Not Available">Customer Not Available</option>
                <option value="Mobile Off">Mobile Off / Unreachable</option>
                <option value="Wrong Address">Wrong Address</option>
                <option value="Customer Refused">Customer Refused Parcel</option>
                <option value="Address Incomplete">Address Incomplete</option>
                <option value="Other">Other Exception Reason</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">Location Checkpoint</label>
            <Input
              value={updateLocationVal}
              onChange={(e) => setUpdateLocationVal(e.target.value)}
              placeholder="e.g. Central Sorting Hub"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">Status Notes</label>
            <Input
              value={updateNotesVal}
              onChange={(e) => setUpdateNotesVal(e.target.value)}
              placeholder="e.g. Scanned at outbound dock"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setSelectedParcelForStatus(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-white font-semibold">
              {submitting ? "Saving..." : "Update Status"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

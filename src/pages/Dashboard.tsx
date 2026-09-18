import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge, ShipmentStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowUpRight,
  Search,
  PlusCircle,
  Building2,
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  RotateCcw,
  FileSpreadsheet,
  Wallet,
  XCircle,
  HelpCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

interface Parcel {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  weight: number;
  deliveryFee: number;
  status: ShipmentStatus;
  createdAt: string;
}

interface DashboardSummary {
  todaysBookings: number;
  pendingDeliveries: number;
  outForDelivery: number;
  deliveredToday: number;
  undeliveredToday: number;
  returnedToday: number;
  todaysCod: number;
  merchantPayable: number;
  todaysIncome: number;
  todaysExpense: number;
  netBalance: number;
  totalParcels: number;
  activeBranches: number;
  activeMerchants: number;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, parcelsRes]: any[] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/parcels"),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (parcelsRes.success && Array.isArray(parcelsRes.data)) {
        setParcels(parcelsRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard summary metrics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-blue-800">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 border border-sky-400/30 mb-3">
            Courier Management Software SRS v1.0
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Courier Operations Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Live consignment tracking, branch logistics, COD collection monitoring, merchant settlement & financial ledgers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/booking/new">
            <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-white font-bold gap-2 shadow-lg text-xs sm:text-sm">
              <PlusCircle className="w-5 h-5" /> New Booking
            </Button>
          </Link>
          <Link to="/tracking">
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/50 font-bold gap-2 backdrop-blur-md shadow-md text-xs sm:text-sm">
              <Search className="w-5 h-5 text-white" /> Search Parcel
            </Button>
          </Link>
        </div>
      </div>

      {/* SRS Section 3: Quick Actions Bar */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
          <Link to="/booking/new" className="bg-white hover:bg-sky-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <PlusCircle className="w-5 h-5 mx-auto text-primary group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">New Booking</span>
          </Link>

          <Link to="/tracking" className="bg-white hover:bg-sky-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <Search className="w-5 h-5 mx-auto text-sky-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">Search Parcel</span>
          </Link>

          <Link to="/delivery-update" className="bg-white hover:bg-emerald-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <Truck className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">Delivery Update</span>
          </Link>

          <Link to="/delivery-update" className="bg-white hover:bg-red-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <RotateCcw className="w-5 h-5 mx-auto text-rose-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">Return</span>
          </Link>

          <Link to="/merchants" className="bg-white hover:bg-purple-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <Store className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">Merchant</span>
          </Link>

          <Link to="/merchant-statement" className="bg-white hover:bg-amber-50 border p-3 rounded-xl text-center shadow-sm transition-all group">
            <Receipt className="w-5 h-5 mx-auto text-amber-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">COD Settlement</span>
          </Link>

          <Link to="/reports" className="bg-white hover:bg-blue-50 border p-3 rounded-xl text-center shadow-sm transition-all group col-span-2 sm:col-span-1">
            <FileSpreadsheet className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold text-slate-800 block">Reports</span>
          </Link>
        </div>
      </div>

      {/* SRS Section 3: Operational Summary Cards (6 Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Operational Logistics Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Today's Booking */}
          <Card className="border-l-4 border-l-primary bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Today's Booking</span>
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{loading ? "..." : summary?.todaysBookings || 0}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Parcels booked today</p>
            </CardContent>
          </Card>

          {/* Pending Delivery */}
          <Card className="border-l-4 border-l-amber-500 bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Pending Delivery</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{loading ? "..." : summary?.pendingDeliveries || 0}</div>
              <p className="text-[10px] text-amber-700 mt-0.5">Awaiting dispatch</p>
            </CardContent>
          </Card>

          {/* Out for Delivery */}
          <Card className="border-l-4 border-l-sky-500 bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Out for Delivery</span>
                <Truck className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600 mt-1 font-mono">{loading ? "..." : summary?.outForDelivery || 0}</div>
              <p className="text-[10px] text-sky-700 mt-0.5">With rider in transit</p>
            </CardContent>
          </Card>

          {/* Delivered */}
          <Card className="border-l-4 border-l-emerald-500 bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Delivered</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{loading ? "..." : summary?.deliveredToday || 0}</div>
              <p className="text-[10px] text-emerald-700 mt-0.5">Successfully fulfilled</p>
            </CardContent>
          </Card>

          {/* Undelivered */}
          <Card className="border-l-4 border-l-orange-500 bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Undelivered</span>
                <XCircle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-orange-600 mt-1 font-mono">{loading ? "..." : summary?.undeliveredToday || 0}</div>
              <p className="text-[10px] text-orange-700 mt-0.5">Exception recorded</p>
            </CardContent>
          </Card>

          {/* Returned */}
          <Card className="border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-3.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Returned</span>
                <RotateCcw className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-600 mt-1 font-mono">{loading ? "..." : summary?.returnedToday || 0}</div>
              <p className="text-[10px] text-red-700 mt-0.5">Returned to merchant</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SRS Section 3: Financial & Accounting Summary Cards (5 Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial & Ledger Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* Today's COD */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Today's COD</span>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                ৳{loading ? "..." : (summary?.todaysCod || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Collected cash volume</p>
            </CardContent>
          </Card>

          {/* Merchant Payable */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Merchant Payable</span>
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
                ৳{loading ? "..." : (summary?.merchantPayable || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Pending COD payout</p>
            </CardContent>
          </Card>

          {/* Today's Income */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Today's Income</span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-sky-700 mt-1 font-mono">
                ৳{loading ? "..." : (summary?.todaysIncome || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Revenue & fees</p>
            </CardContent>
          </Card>

          {/* Today's Expense */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Today's Expense</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
                -৳{loading ? "..." : (summary?.todaysExpense || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Office & fuel expenses</p>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className="bg-gradient-to-br from-slate-900 to-primary text-white shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sky-200 text-[11px] font-extrabold">
                <span>Net Balance</span>
                <DollarSign className="w-4 h-4 text-sky-300" />
              </div>
              <div className="text-2xl font-black mt-1 font-mono text-white">
                ৳{loading ? "..." : (summary?.netBalance || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">Income minus Expense</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Parcels Table Card */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-base font-bold">Recent Consignment Dispatch Log</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live updates from local hub logistics network
            </CardDescription>
          </div>
          <Link to="/parcels">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-blue-800 text-xs font-bold">
              View All Parcels <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading parcel records from server...</div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-b-xl border-t border-red-100 text-sm">
              <AlertOctagon className="w-6 h-6 mx-auto mb-2 text-red-500" />
              {error}
            </div>
          ) : parcels.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No parcels currently registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">CN / Tracking #</th>
                    <th className="px-6 py-3.5 font-semibold">Sender Details</th>
                    <th className="px-6 py-3.5 font-semibold">Recipient</th>
                    <th className="px-6 py-3.5 font-semibold">Weight</th>
                    <th className="px-6 py-3.5 font-semibold">Delivery Fee</th>
                    <th className="px-6 py-3.5 font-semibold">Current Status</th>
                    <th className="px-6 py-3.5 font-semibold">Date</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.slice(0, 5).map((parcel: any) => (
                    <tr key={parcel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        {parcel.cnNumber || parcel.trackingNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 text-xs">{parcel.senderName}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{parcel.recipientName}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{parcel.weight} kg</td>
                      <td className="px-6 py-4 font-semibold text-emerald-700 text-xs font-mono">৳{parcel.deliveryFee.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={parcel.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(parcel.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/tracking?tn=${parcel.cnNumber || parcel.trackingNumber}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-slate-300">
                            Track <Search className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

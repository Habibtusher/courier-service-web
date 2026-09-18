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
  Copy,
  Check,
  Activity,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Parcel {
  id: string;
  cnNumber?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyTrackingNumber = (tn: string) => {
    navigator.clipboard.writeText(tn);
    setCopiedId(tn);
    toast.success(`Tracking # ${tn} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate delivery fulfillment percentage
  const totalActionable = (summary?.deliveredToday || 0) + (summary?.outForDelivery || 0) + (summary?.pendingDeliveries || 0) + (summary?.returnedToday || 0);
  const fulfillmentRate = totalActionable > 0 
    ? Math.round(((summary?.deliveredToday || 0) / totalActionable) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* 1. Hero Welcome Operations Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh-gradient border border-slate-800/80 p-6 sm:p-8 text-white shadow-2xl shadow-blue-950/20">
        {/* Glow ambient background circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 border border-white/15 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE LOGISTICS ENGINE</span>
              <span className="text-white/40">•</span>
              <span className="text-sky-300">Enterprise v1.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
              Courier Operations Dashboard
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xl font-normal">
              Real-time consignment dispatch tracking, hub logistics, COD collections, merchant financial payouts, and active branch ledgers.
            </p>

            {/* Quick Live Snapshot Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Active Hubs: <strong className="text-white font-bold">{summary?.activeBranches || 1}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Store className="w-3.5 h-3.5 text-purple-400" />
                <span>Merchants: <strong className="text-white font-bold">{summary?.activeMerchants || 0}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Consignments: <strong className="text-white font-bold">{summary?.totalParcels || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/booking/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold gap-2.5 shadow-glow-blue rounded-xl text-xs sm:text-sm h-11 transition-all hover-lift border border-sky-400/30">
                <PlusCircle className="w-5 h-5 text-sky-100" /> New Consignment
              </Button>
            </Link>
            <Link to="/tracking" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/25 font-bold gap-2 backdrop-blur-md rounded-xl text-xs sm:text-sm h-11 transition-all">
                <Search className="w-4 h-4 text-sky-300" /> Track Parcel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Logistics Fulfillment Gauge Visualizer */}
      <Card className="border border-slate-200/80 bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-heading">Today's Delivery Fulfillment Gauge</h3>
                <p className="text-xs text-slate-500">Live operational ratio across all local courier hubs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Completion Score:</span>
              <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                {fulfillmentRate}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200/60 shadow-inner">
            <div 
              style={{ width: `${fulfillmentRate}%` }} 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-xs" 
              title={`Delivered: ${summary?.deliveredToday || 0}`}
            />
            <div 
              style={{ width: `${totalActionable > 0 ? ((summary?.outForDelivery || 0) / totalActionable) * 100 : 0}%` }} 
              className="h-full bg-sky-400 rounded-full transition-all duration-500" 
              title={`Out for Delivery: ${summary?.outForDelivery || 0}`}
            />
            <div 
              style={{ width: `${totalActionable > 0 ? ((summary?.pendingDeliveries || 0) / totalActionable) * 100 : 0}%` }} 
              className="h-full bg-amber-400 rounded-full transition-all duration-500" 
              title={`Pending: ${summary?.pendingDeliveries || 0}`}
            />
            <div 
              style={{ width: `${totalActionable > 0 ? ((summary?.returnedToday || 0) / totalActionable) * 100 : 0}%` }} 
              className="h-full bg-rose-400 rounded-full transition-all duration-500" 
              title={`Returned: ${summary?.returnedToday || 0}`}
            />
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Delivered ({summary?.deliveredToday || 0})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
              <span>In Transit ({summary?.outForDelivery || 0})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Pending Hub ({summary?.pendingDeliveries || 0})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span>Returned ({summary?.returnedToday || 0})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Quick Action Shortcut Bar (7 Tiles SRS Spec) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Dispatch Shortcuts & Quick Actions
          </h2>
          <span className="text-[11px] text-slate-400">SRS Specification Section 3</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <Link to="/booking/new" className="group bg-white hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">New Booking</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Create parcel</span>
            </div>
          </Link>

          <Link to="/tracking" className="group bg-white hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 block">Search Parcel</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Live tracking</span>
            </div>
          </Link>

          <Link to="/delivery-update" className="group bg-white hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">Delivery Update</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Mark status</span>
            </div>
          </Link>

          <Link to="/delivery-update" className="group bg-white hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700 block">Parcel Return</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Process returns</span>
            </div>
          </Link>

          <Link to="/merchants" className="group bg-white hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 block">Merchants</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Directory & rates</span>
            </div>
          </Link>

          <Link to="/merchant-statement" className="group bg-white hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">COD Settlement</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Merchant payouts</span>
            </div>
          </Link>

          <Link to="/reports" className="group bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 p-3.5 rounded-2xl shadow-xs transition-all duration-300 hover-lift flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 block">Analytics & Report</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">Excel & statements</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Operational Logistics Metrics Cards (6 Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading px-1">
          Operational Logistics Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Today's Booking */}
          <Card className="border-l-4 border-l-blue-600 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Today's Booking</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {loading ? "..." : summary?.todaysBookings || 0}
              </div>
              <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                <span className="text-emerald-600 font-bold">Live</span> parcels registered
              </p>
            </CardContent>
          </Card>

          {/* Pending Delivery */}
          <Card className="border-l-4 border-l-amber-500 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Pending Hub</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">
                {loading ? "..." : summary?.pendingDeliveries || 0}
              </div>
              <p className="text-[10px] font-medium text-amber-700">Awaiting rider dispatch</p>
            </CardContent>
          </Card>

          {/* Out for Delivery */}
          <Card className="border-l-4 border-l-sky-500 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Out for Delivery</span>
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-600 font-mono tracking-tight">
                {loading ? "..." : summary?.outForDelivery || 0}
              </div>
              <p className="text-[10px] font-medium text-sky-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Rider in transit
              </p>
            </CardContent>
          </Card>

          {/* Delivered */}
          <Card className="border-l-4 border-l-emerald-500 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Delivered Today</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
                {loading ? "..." : summary?.deliveredToday || 0}
              </div>
              <p className="text-[10px] font-medium text-emerald-700">Successfully fulfilled</p>
            </CardContent>
          </Card>

          {/* Undelivered */}
          <Card className="border-l-4 border-l-orange-500 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Undelivered</span>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-orange-600 font-mono tracking-tight">
                {loading ? "..." : summary?.undeliveredToday || 0}
              </div>
              <p className="text-[10px] font-medium text-orange-700">Exception logged</p>
            </CardContent>
          </Card>

          {/* Returned */}
          <Card className="border-l-4 border-l-rose-500 bg-white shadow-xs hover-lift transition-all rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold">
                <span>Returned</span>
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight">
                {loading ? "..." : summary?.returnedToday || 0}
              </div>
              <p className="text-[10px] font-medium text-rose-700">Returned to merchant</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. Financial & Accounting Summary Cards (5 Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading px-1">
          Financial & Ledger Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* Today's COD */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-200/80 shadow-xs hover-lift rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-emerald-800 text-[11px] font-bold">
                <span>Today's COD Collected</span>
                <div className="p-1.5 bg-emerald-500/20 text-emerald-700 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                ৳{loading ? "..." : (summary?.todaysCod || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-800/80">Collected cash volume</p>
            </CardContent>
          </Card>

          {/* Merchant Payable */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/10 border border-purple-200/80 shadow-xs hover-lift rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-purple-800 text-[11px] font-bold">
                <span>Merchant Payable</span>
                <div className="p-1.5 bg-purple-500/20 text-purple-700 rounded-lg">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
                ৳{loading ? "..." : (summary?.merchantPayable || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-purple-800/80">Pending COD payout</p>
            </CardContent>
          </Card>

          {/* Today's Income */}
          <Card className="bg-gradient-to-br from-sky-500/5 to-blue-500/10 border border-sky-200/80 shadow-xs hover-lift rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-sky-900 text-[11px] font-bold">
                <span>Today's Income</span>
                <div className="p-1.5 bg-sky-500/20 text-sky-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-sky-700 font-mono tracking-tight">
                ৳{loading ? "..." : (summary?.todaysIncome || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-sky-800/80">Revenue & delivery fees</p>
            </CardContent>
          </Card>

          {/* Today's Expense */}
          <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/10 border border-amber-200/80 shadow-xs hover-lift rounded-2xl">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex justify-between items-center text-amber-900 text-[11px] font-bold">
                <span>Today's Expense</span>
                <div className="p-1.5 bg-amber-500/20 text-amber-700 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
                -৳{loading ? "..." : (summary?.todaysExpense || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-amber-800/80">Fuel & office overhead</p>
            </CardContent>
          </Card>

          {/* Net Balance (Highlighted Hero Financial Card) */}
          <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border border-blue-900/50 shadow-lg shadow-blue-950/20 hover-lift rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4 space-y-1.5 relative z-10">
              <div className="flex justify-between items-center text-sky-300 text-[11px] font-extrabold">
                <span>Net Profit Balance</span>
                <div className="p-1.5 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/30">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-white">
                ৳{loading ? "..." : (summary?.netBalance || 0).toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Income minus expense
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. Main Consignment Dispatch Log Table */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold font-heading text-slate-900">
                Recent Consignment Dispatch Log
              </CardTitle>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-[10px] font-bold">
                Live Feed
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Real-time consignment status updates from hub logistics network
            </CardDescription>
          </div>

          <Link to="/parcels">
            <Button variant="outline" size="sm" className="gap-1.5 text-blue-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              View All Consignments <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm space-y-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>Fetching consignment logs from server...</div>
            </div>
          ) : error ? (
            <div className="p-10 text-center bg-rose-50 text-rose-600 rounded-b-2xl border-t border-rose-100 text-sm">
              <AlertOctagon className="w-6 h-6 mx-auto mb-2 text-rose-500" />
              {error}
            </div>
          ) : parcels.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No consignment packages registered today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/70 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">CN / Tracking #</th>
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4">Delivery Fee</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.slice(0, 7).map((parcel: any) => {
                    const tn = parcel.cnNumber || parcel.trackingNumber;
                    return (
                      <tr key={parcel.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                          <button
                            onClick={() => copyTrackingNumber(tn)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 group-hover:bg-white rounded-lg border border-slate-200/80 hover:border-blue-400 text-slate-800 transition-all font-mono"
                            title="Click to copy tracking number"
                          >
                            <span>{tn}</span>
                            {copiedId === tn ? (
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 text-xs">{parcel.senderName}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{parcel.recipientName}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs font-medium">{parcel.weight} kg</td>
                        <td className="px-6 py-4 font-extrabold text-emerald-700 text-xs font-mono">
                          ৳{parcel.deliveryFee.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={parcel.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">{formatDate(parcel.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/tracking?tn=${tn}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-slate-200 hover:bg-blue-50 hover:text-blue-700 rounded-xl">
                              Track <ChevronRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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

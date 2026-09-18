import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Search, LayoutDashboard, Truck } from "lucide-react";
import { Button } from "./ui/Button";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-white shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90">
          <div className="p-2 bg-blue-600 rounded-lg shadow-inner">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span>SwiftCourier <span className="text-sky-300 text-xs font-normal px-2 py-0.5 rounded bg-blue-900/60 border border-sky-400/30">Enterprise</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-300 ${
              isActive("/") ? "text-sky-300 font-semibold underline underline-offset-8 decoration-2" : "text-slate-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/parcels"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-300 ${
              isActive("/parcels") ? "text-sky-300 font-semibold underline underline-offset-8 decoration-2" : "text-slate-100"
            }`}
          >
            <Package className="h-4 w-4" /> Shipments
          </Link>
          <Link
            to="/tracking"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-300 ${
              isActive("/tracking") ? "text-sky-300 font-semibold underline underline-offset-8 decoration-2" : "text-slate-100"
            }`}
          >
            <Search className="h-4 w-4" /> Live Tracking
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/tracking">
            <Button size="sm" variant="info" className="gap-2 shadow-sm font-medium">
              <Search className="h-4 w-4" /> Track Parcel
            </Button>
          </Link>
          <Link to="/parcels?action=new">
            <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-white font-medium gap-1 shadow-sm">
              <Package className="h-4 w-4" /> + New Parcel
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

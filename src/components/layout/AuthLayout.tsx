import React from "react";
import { Truck, ShieldCheck, Globe } from "lucide-react";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-slate-100 font-sans">
      {/* Left Branding Side (Desktop) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-primary to-slate-950 border-r border-slate-800 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 z-10">
          <div className="p-3 bg-sky-500/20 backdrop-blur-md rounded-xl border border-sky-400/30">
            <Truck className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">SwiftCourier</h1>
            <span className="text-xs text-sky-300 font-medium">Enterprise Logistics System</span>
          </div>
        </div>

        <div className="space-y-6 z-10 my-auto max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
            Seamless Global Dispatch & Real-Time Settlement Control
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Manage parcel routing, multi-branch dispatch logs, role-based user access, and accounting settlements from a single unified portal.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-sky-400 mb-1" />
              <div className="font-bold text-sm text-white">RBAC Security</div>
              <div className="text-xs text-slate-400">Admin, Operator, Branch & Accounts</div>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <Globe className="w-6 h-6 text-emerald-400 mb-1" />
              <div className="font-bold text-sm text-white">Live Tracking</div>
              <div className="text-xs text-slate-400">Real-time status updates</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} SwiftCourier Enterprise System. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

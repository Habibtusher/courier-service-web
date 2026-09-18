import React from "react";
import { Truck, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-slate-900 text-slate-300 mt-auto">
      <div className="container px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <Truck className="h-5 w-5 text-sky-400" /> SwiftCourier
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise Courier & Logistics Management platform delivering real-time parcel tracking, status settlements, and global route automation.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-sky-400 transition-colors">Overview Dashboard</a></li>
              <li><a href="/parcels" className="hover:text-sky-400 transition-colors">Parcel Management</a></li>
              <li><a href="/tracking" className="hover:text-sky-400 transition-colors">Real-time Package Tracking</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Status Categories</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span> Delivered & Settled
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info"></span> Picked Up & In Transit
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning"></span> Pending & Returned
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span> Undelivered / Exception
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-sky-400" /> Central Dispatch Hub 42</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-sky-400" /> +1 (800) 555-SWIFT</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-sky-400" /> support@swiftcourier.io</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SwiftCourier Management System. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

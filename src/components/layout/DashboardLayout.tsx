import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  LayoutDashboard,
  Package,
  Search,
  Building2,
  Store,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Bike,
  PackageCheck,
  DollarSign,
  FileSpreadsheet,
  Landmark,
  Settings as SettingsIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "Overview Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "New Booking Engine",
    path: "/booking/new",
    icon: PlusCircle,
  },
  {
    title: "Reports & Analytics",
    path: "/reports",
    icon: FileSpreadsheet,
    roles: ["ADMIN", "OPERATOR", "ACCOUNTS_USER"],
  },
  {
    title: "Accounting & Profit",
    path: "/accounts",
    icon: Landmark,
    roles: ["ADMIN", "ACCOUNTS_USER"],
  },
  {
    title: "Merchant Financials",
    path: "/merchant-statement",
    icon: DollarSign,
    roles: ["ADMIN", "ACCOUNTS_USER", "OPERATOR"],
  },
  {
    title: "Delivery Update Workspace",
    path: "/delivery-update",
    icon: PackageCheck,
  },
  {
    title: "Rider Management",
    path: "/riders",
    icon: Bike,
    roles: ["ADMIN", "OPERATOR", "BRANCH_USER"],
  },
  {
    title: "Parcels & Shipments",
    path: "/parcels",
    icon: Package,
  },
  {
    title: "Live Package Tracking",
    path: "/tracking",
    icon: Search,
  },
  {
    title: "Branch Operations",
    path: "/branches",
    icon: Building2,
    roles: ["ADMIN", "OPERATOR", "BRANCH_USER"],
  },
  {
    title: "Merchant Directory",
    path: "/merchants",
    icon: Store,
    roles: ["ADMIN", "OPERATOR", "ACCOUNTS_USER"],
  },
  {
    title: "User Management",
    path: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "System Settings",
    path: "/settings",
    icon: SettingsIcon,
    roles: ["ADMIN"],
  },
];

const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "OPERATOR":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "BRANCH_USER":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "ACCOUNTS_USER":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile/Tablet Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Drawer (Fixed left & internally scrollable) */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div>
            {/* Logo Brand Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950 shrink-0 sticky top-0 z-10">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">
                  Swift<span className="text-sky-400">Courier</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Navigation Menu
              </div>
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md font-bold"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-300" : "text-slate-400"}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-300 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Card at bottom of Sidebar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 sticky bottom-0 z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-inner shrink-0">
                {user?.name.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="font-bold text-xs text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Column: Fixed Topbar Header + Only Main Content Scrolls! */}
      <div className="flex-1 flex flex-col h-screen min-w-0 w-full overflow-hidden">
        {/* Fixed Topbar Header */}
        <header className="h-16 shrink-0 border-b bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
              <span className="text-xs font-bold text-slate-800 lg:hidden">Menu</span>
            </button>
            <div className="text-sm font-bold text-slate-800 truncate hidden sm:block">
              Courier Management System
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Branch Indicator */}
            {user?.branchName && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-primary" /> {user.branchName}
              </div>
            )}

            {/* Role Badge */}
            {user && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${getRoleBadgeStyle(
                  user.role
                )}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> {user.role.replace("_", " ")}
              </span>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="h-8 text-xs gap-1 border-slate-300 text-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Main Content (ONLY this section scrolls vertically!) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React, { useState, useEffect } from "react";
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
  Clock,
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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Drawer (Fixed left & internally scrollable) */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-[#0B0F19] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-slate-800/80 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div>
            {/* Logo Brand Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-[#070A12] shrink-0 sticky top-0 z-10">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl shadow-glow-blue transition-transform group-hover:scale-105">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading text-white font-extrabold text-xl">
                  Swift<span className="text-sky-400">Courier</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              <div className="px-3.5 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Main Operations
              </div>
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/30 to-sky-500/10 text-white font-bold border-l-2 border-sky-400 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Card at bottom of Sidebar */}
          <div className="p-3.5 border-t border-slate-800/80 bg-[#070A12] shrink-0 sticky bottom-0 z-10">
            <div className="flex items-center gap-3 mb-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {user?.name.charAt(0) || "U"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#070A12] animate-pulse" />
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
              className="w-full justify-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 gap-2 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Column: Fixed Topbar Header + Only Main Content Scrolls! */}
      <div className="flex-1 flex flex-col h-screen min-w-0 w-full overflow-hidden">
        {/* Fixed Topbar Header */}
        <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 border border-slate-200"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
              <span className="text-xs font-bold text-slate-800 lg:hidden">Menu</span>
            </button>
            <div className="text-sm font-extrabold text-slate-800 tracking-tight truncate hidden sm:block font-heading">
              SwiftCourier <span className="text-slate-400 font-normal text-xs ml-1">Enterprise Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Real-time Clock Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100/90 rounded-full text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-2xs font-mono">
              <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-600">{formattedDate}</span>
              <span className="text-slate-300">|</span>
              <span className="font-extrabold text-slate-900">{formattedTime}</span>
            </div>
            {/* Branch Indicator */}
            {user?.branchName && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 rounded-full text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> {user.branchName}
              </div>
            )}

            {/* Role Badge */}
            {user && (
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${getRoleBadgeStyle(
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
              className="h-8 text-xs gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs"
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

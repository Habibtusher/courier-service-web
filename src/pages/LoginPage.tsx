import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Truck, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword("password");
    setError(null);
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 border-b border-slate-800 bg-slate-950/60 p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 mb-1">
          <Truck className="w-6 h-6 text-sky-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">System Sign In</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Enter your authorized credentials to access the Courier Management System
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="user@courier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-white text-sm h-10 placeholder:text-slate-600 focus-visible:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className="text-[10px] text-sky-400 cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-white text-sm h-10 placeholder:text-slate-600 focus-visible:ring-sky-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg gap-2 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Quick Demo Logins for required 4 Roles */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Quick Demo Role Logins
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoUser("admin@courier.com", "ADMIN")}
              className="p-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 rounded-lg text-purple-200 text-left transition-colors font-medium"
            >
              👑 Admin User
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("operator@courier.com", "OPERATOR")}
              className="p-2 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded-lg text-sky-200 text-left transition-colors font-medium"
            >
              🚛 Operator
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("branch@courier.com", "BRANCH_USER")}
              className="p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg text-amber-200 text-left transition-colors font-medium"
            >
              🏢 Branch User
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("accounts@courier.com", "ACCOUNTS_USER")}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg text-emerald-200 text-left transition-colors font-medium"
            >
              💰 Accounts User
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

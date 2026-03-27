"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, GraduationCap, Briefcase, AlertCircle, Eye, EyeOff } from "lucide-react";

type Tab = "student" | "employee";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect based on tab selection
      if (tab === "student") {
        window.location.href = "/student/dashboard";
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-3 sm:px-5">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/images/EDWARTENS ICON Transparent.png"
                alt="EDWartens"
                width={56}
                height={56}
                className="mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-text-muted">
              Sign in to your EDWartens account
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setTab("student"); setEmail(""); setPassword(""); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tab === "student"
                  ? "bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
                  : "bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-white hover:border-white/[0.12]"
              }`}
            >
              <GraduationCap size={18} />
              Student
            </button>
            <button
              type="button"
              onClick={() => { setTab("employee"); setEmail(""); setPassword(""); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tab === "employee"
                  ? "bg-neon-green/10 border border-neon-green/30 text-neon-green"
                  : "bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-white hover:border-white/[0.12]"
              }`}
            >
              <Briefcase size={18} />
              Employee
            </button>
          </div>

          {/* Tab description */}
          <p className="text-xs text-text-muted text-center mb-6">
            {tab === "student"
              ? "Access your courses, sessions, and certificates"
              : "Access the admin dashboard, leads, and student management"}
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-white/[0.2]"
                placeholder={tab === "student" ? "student@example.com" : "admin@edwartens.co.uk"}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-white/[0.2]"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50 ${
                tab === "student"
                  ? "bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white hover:shadow-lg hover:shadow-neon-blue/25"
                  : "bg-gradient-to-r from-neon-green to-neon-green/80 text-dark-primary hover:shadow-lg hover:shadow-neon-green/25"
              }`}
            >
              <LogIn size={16} />
              {loading
                ? "Signing in..."
                : tab === "student"
                ? "Enter Student Portal"
                : "Enter Employee Portal"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <Link
              href="/"
              className="text-sm text-text-muted hover:text-neon-blue transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Globe, ChevronDown, LayoutDashboard } from "lucide-react";

// Desktop nav - compact, only key pages
const desktopLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Training", href: "/training" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Mobile nav - full list
const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Training", href: "/training" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Careers", href: "/placements" },
  { label: "Reviews", href: "/reviews" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const regions = [
  { code: "IN", name: "India", domain: "edwartens.co.in", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", domain: "edwartens.co.uk", flag: "🇬🇧" },
  { code: "AE", name: "UAE", domain: "edwartens.com/uae", flag: "🇦🇪" },
  { code: "US", name: "United States", domain: "edwartens.com/us", flag: "🇺🇸" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.email) {
          setIsLoggedIn(true);
          setUserRole(data.user.role || null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-6 pt-3">
      <div
        className={`mx-auto max-w-7xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "rounded-xl bg-dark-primary/85 backdrop-blur-2xl border border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/EDWARTENS LOGO UK.png"
              alt="EDWartens UK Logo"
              width={scrolled ? 140 : 160}
              height={scrolled ? 40 : 48}
              className="transition-all duration-700 h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-[13px] text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop: Login/Dashboard + Region */}
            {isLoggedIn ? (
              <Link
                href={userRole === "STUDENT" ? "/student/dashboard" : "/admin/dashboard"}
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-sm hover:bg-neon-blue/20 transition-colors font-medium"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg border border-white/10 text-text-secondary text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                Login
              </Link>
            )}

            {/* Region selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setRegionOpen(!regionOpen);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Select region"
              >
                <Globe size={20} />
              </button>
              {regionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRegionOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl p-3 z-50 animate-fade-in-up">
                    <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2 px-2">
                      Select Region
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {regions.map((r) => (
                        <a
                          key={r.code}
                          href={`https://${r.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-text-secondary hover:text-white"
                        >
                          <span className="text-base">{r.flag}</span>
                          <span className="text-xs font-medium">{r.code}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger - hidden on desktop */}
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setRegionOpen(false);
              }}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Popup - only on smaller screens */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden absolute right-3 sm:right-5 top-[72px] w-64 glass-card rounded-xl p-4 z-50 animate-slide-in-right">
            <div className="flex flex-col gap-1">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/[0.06] mt-3 pt-3">
              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Find Programs
              </Link>
            </div>

            <div className="border-t border-white/[0.06] mt-3 pt-3">
              <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">
                Contact
              </p>
              <a
                href="mailto:info@wartens.com"
                className="text-xs text-neon-blue hover:underline"
              >
                info@wartens.com
              </a>
            </div>

            <div className="border-t border-white/[0.06] mt-3 pt-3">
              <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">
                Regions
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {regions.map((r) => (
                  <a
                    key={r.code}
                    href={`https://${r.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm">{r.flag}</span>
                    <span className="text-[10px] text-text-muted">{r.code}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <Link
                href={isLoggedIn ? (userRole === "STUDENT" ? "/student/dashboard" : "/admin/dashboard") : "/login"}
                onClick={() => setIsOpen(false)}
                className={`block w-full text-center px-4 py-2 rounded-lg text-sm transition-colors ${
                  isLoggedIn
                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-medium"
                    : "border border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                {isLoggedIn ? "Dashboard" : "Login"}
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PlayCircle,
  TrendingUp,
  Monitor,
  ClipboardCheck,
  FileCode,
  FileText,
  Globe,
  BarChart,
  Award,
  CreditCard,
  Briefcase,
  User,
  HelpCircle,
  Menu,
  X,
  File,
} from "lucide-react";

interface StudentSidebarProps {
  userName: string;
  userEmail: string;
  onboarded: boolean;
}

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/sessions", label: "Sessions", icon: PlayCircle },
  { href: "/student/progress", label: "Progress", icon: TrendingUp },
  { href: "/student/software", label: "Software", icon: Monitor },
  { href: "/student/assessments", label: "Assessments", icon: ClipboardCheck },
  { href: "/student/project", label: "Project", icon: FileCode },
  { href: "/student/resume", label: "Resume & CV", icon: File },
  { href: "/student/linkedin", label: "LinkedIn", icon: Globe },
  { href: "/student/job-tracker", label: "Job Tracker", icon: BarChart },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/documents", label: "Documents", icon: FileText },
  { href: "/student/payments", label: "Payments", icon: CreditCard },
  { href: "/student/jobs", label: "Jobs", icon: Briefcase },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/support", label: "Support", icon: HelpCircle },
];

export default function StudentSidebar({
  userName,
  userEmail,
  onboarded,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/student/dashboard") {
      return pathname === "/student" || pathname === "/student/dashboard";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/EDWARTENS ICON Transparent.png"
            alt="EDWartens"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-sm font-semibold text-text-primary">
            EDWartens
          </span>
        </Link>
      </div>

      {/* Student Info */}
      <div className="p-4 border-b border-border">
        <p className="text-sm font-medium text-text-primary truncate">
          {userName}
        </p>
        <p className="text-xs text-text-muted truncate">{userEmail}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {onboarded ? (
          navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-text-muted">
              Complete onboarding to access the portal
            </p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          EDWartens UK &copy; {new Date().getFullYear()}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-dark-secondary border border-border text-text-secondary hover:text-text-primary transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-56 flex-col glass-card rounded-none border-r border-border border-y-0 border-l-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-dark-secondary border-r border-border transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

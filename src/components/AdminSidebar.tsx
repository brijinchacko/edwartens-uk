"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  GraduationCap,
  Layers,
  Video,
  ClipboardCheck,
  BookOpen,
  Briefcase,
  Award,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  UserCog,
  Target,
  Shield,
  FileText,
  Upload,
  BarChart3,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { getNavItemsForRole } from "@/lib/rbac";

interface AdminSidebarProps {
  userName: string;
  userRole: string;
  userImage?: string;
}

const ALL_NAV_ITEMS = [
  { id: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", href: "/admin/leads", label: "Leads", icon: Target },
  { id: "pipeline", href: "/admin/pipeline", label: "Pipeline", icon: GitBranch },
  { id: "students", href: "/admin/students", label: "Students", icon: GraduationCap },
  { id: "batches", href: "/admin/batches", label: "Batches", icon: Layers },
  { id: "sessions", href: "/admin/sessions", label: "Sessions", icon: Video },
  { id: "assessments", href: "/admin/assessments", label: "Assessments", icon: ClipboardCheck },
  { id: "question-bank", href: "/admin/question-bank", label: "Question Bank", icon: BookOpen },
  { id: "import", href: "/admin/import", label: "Import Data", icon: Upload },
  { id: "career", href: "/admin/placements", label: "Career Support", icon: Briefcase },
  { id: "certificates", href: "/admin/certificates", label: "Certificates", icon: Award },
  { id: "invoices", href: "/admin/invoices", label: "Invoices", icon: FileText },
  { id: "jobs", href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { id: "alumni", href: "/admin/alumni", label: "Alumni", icon: Users },
  { id: "team-activity", href: "/admin/team-activity", label: "Team Activity", icon: Users },
  { id: "employees", href: "/admin/employees", label: "Team", icon: UserCog },
  { id: "reports", href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { id: "users", href: "/admin/users", label: "User Management", icon: Shield },
  { id: "notifications", href: "/admin/notifications", label: "Notifications", icon: Bell },
  { id: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  userName,
  userRole,
  userImage,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => {
    const allowedIds = getNavItemsForRole(userRole);
    return ALL_NAV_ITEMS.filter((item) => allowedIds.includes(item.id));
  }, [userRole]);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
        <Image
          src="/images/EDWARTENS ICON Transparent.png"
          alt="EDWartens UK Logo"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-sm font-semibold text-text-primary">
            EDWartens UK
          </h1>
          <p className="text-[11px] text-text-muted">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-medium text-neon-blue">
              {getInitials(userName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{userName}</p>
            <p className="text-[11px] text-text-muted">{userRole}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-white/[0.03] transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card text-text-secondary hover:text-text-primary transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col
          bg-dark-secondary/95 backdrop-blur-xl
          border-r border-white/[0.06]
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

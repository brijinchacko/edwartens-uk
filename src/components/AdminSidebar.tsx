"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  Mail,
  MessageSquare,
  Droplets,
  Calendar,
  Gift,
  ScrollText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  MailOpen,
  Crosshair,
  UsersRound,
  Database,
  Cog,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { getNavItemsForRole } from "@/lib/rbac";

interface AdminSidebarProps {
  userName: string;
  userRole: string;
  userImage?: string;
}

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: NavItem[];
}

const DASHBOARD_ITEM: NavItem = {
  id: "dashboard",
  href: "/admin/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: "sales",
    label: "Sales & Leads",
    icon: FolderKanban,
    items: [
      { id: "leads", href: "/admin/leads", label: "Leads", icon: Target },
      { id: "pipeline", href: "/admin/pipeline", label: "Pipeline", icon: GitBranch },
      { id: "drip-campaigns", href: "/admin/drip-campaigns", label: "Drip Campaigns", icon: Droplets },
    ],
  },
  {
    key: "training",
    label: "Training",
    icon: GraduationCap,
    items: [
      { id: "students", href: "/admin/students", label: "Students", icon: GraduationCap },
      { id: "batches", href: "/admin/batches", label: "Batches", icon: Layers },
      { id: "sessions", href: "/admin/sessions", label: "Sessions", icon: Video },
      { id: "assessments", href: "/admin/assessments", label: "Assessments", icon: ClipboardCheck },
      { id: "question-bank", href: "/admin/question-bank", label: "Question Bank", icon: BookOpen },
      { id: "certificates", href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: MailOpen,
    items: [
      { id: "emails", href: "/admin/emails", label: "Emails", icon: Mail },
      { id: "calendar", href: "/admin/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    key: "career",
    label: "Career & Alumni",
    icon: Crosshair,
    items: [
      { id: "career", href: "/admin/placements", label: "Career Support", icon: Briefcase },
      { id: "alumni", href: "/admin/alumni", label: "Alumni", icon: Users },
      { id: "jobs", href: "/admin/jobs", label: "Jobs", icon: Briefcase },
      { id: "referrals", href: "/admin/referrals", label: "Referrals", icon: Gift },
    ],
  },
  {
    key: "team",
    label: "Team & HR",
    icon: UsersRound,
    items: [
      { id: "team-activity", href: "/admin/team-activity", label: "Team Activity", icon: Users },
      { id: "employees", href: "/admin/employees", label: "Team", icon: UserCog },
      { id: "reports", href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { id: "feedback", href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
    ],
  },
  {
    key: "data",
    label: "Data",
    icon: Database,
    items: [
      { id: "import", href: "/admin/import", label: "Import Data", icon: Upload },
      { id: "invoices", href: "/admin/invoices", label: "Invoices", icon: FileText },
    ],
  },
];

// System items moved to user profile dropdown
const SYSTEM_ITEMS = [
  { id: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
  { id: "notifications", href: "/admin/notifications", label: "Notifications", icon: Bell },
  { id: "users", href: "/admin/users", label: "User Management", icon: Shield },
  { id: "audit", href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

const STORAGE_KEY = "edw-sidebar-groups";

function loadExpandedGroups(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveExpandedGroups(groups: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // silently fail
  }
}

export function AdminSidebar({
  userName,
  userRole,
  userImage,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const allowedIds = useMemo(() => getNavItemsForRole(userRole), [userRole]);

  // Filter groups: only show groups that have at least one visible item
  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => allowedIds.includes(item.id)),
    })).filter((group) => group.items.length > 0);
  }, [allowedIds]);

  const showDashboard = allowedIds.includes("dashboard");

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Find which group contains the current active page and auto-expand it
  useEffect(() => {
    const stored = loadExpandedGroups();
    const activeGroupKey = visibleGroups.find((group) =>
      group.items.some((item) => isActive(item.href))
    )?.key;

    if (activeGroupKey && !stored.includes(activeGroupKey)) {
      const merged = [...stored, activeGroupKey];
      setExpandedGroups(merged);
      saveExpandedGroups(merged);
    } else {
      setExpandedGroups(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      saveExpandedGroups(next);
      return next;
    });
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
        <Image
          src="/images/EDWARTENS ICON Transparent.png"
          alt="EDWartens UK Logo"
          width={36}
          height={36}
          className="rounded-lg sidebar-logo"
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
        {/* Dashboard - always top level */}
        {showDashboard && (
          <Link
            href={DASHBOARD_ITEM.href}
            onClick={() => setMobileOpen(false)}
            className={`sidebar-link ${isActive(DASHBOARD_ITEM.href) ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>{DASHBOARD_ITEM.label}</span>
          </Link>
        )}

        {/* Grouped nav items */}
        {visibleGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.key);
          const GroupIcon = group.icon;
          const hasActiveChild = group.items.some((item) => isActive(item.href));

          return (
            <div key={group.key} className="mt-3">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  hasActiveChild
                    ? "text-neon-blue/80"
                    : "text-text-muted hover:text-text-secondary"
                } hover:bg-white/[0.03]`}
              >
                <GroupIcon size={14} className="shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isExpanded ? (
                  <ChevronDown size={14} className="shrink-0" />
                ) : (
                  <ChevronRight size={14} className="shrink-0" />
                )}
              </button>

              {/* Group items */}
              {isExpanded && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`sidebar-link pl-8 ${active ? "active" : ""}`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section with system menu */}
      <div className="border-t border-white/[0.06] p-3 relative">
        {/* System menu dropdown (opens upward) */}
        {showUserMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-white/[0.08] bg-[#0c1018] shadow-2xl overflow-hidden z-50">
            {SYSTEM_ITEMS.filter((item) => allowedIds.includes(item.id)).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => { setShowUserMenu(false); setMobileOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${
                  pathname === item.href
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06]">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-white/[0.03] transition-colors"
        >
          {userImage ? (
            <Image src={userImage} alt={userName} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-medium text-neon-blue">
              {getInitials(userName)}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm text-text-primary truncate">{userName}</p>
            <p className="text-[11px] text-text-muted">{userRole.replace(/_/g, " ")}</p>
          </div>
          <ChevronUp size={14} className={`text-text-muted transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
        </button>
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

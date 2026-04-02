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
  ChevronLeft,
  FolderKanban,
  MailOpen,
  Crosshair,
  UsersRound,
  Database,
  Cog,
  Activity,
  Send,
  Monitor,
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

// Simple flat nav for agents (no groups, just links)
const AGENT_NAV: NavItem[] = [
  { id: "dashboard", href: "/admin/dashboard", label: "My Day", icon: LayoutDashboard },
  { id: "leads", href: "/admin/leads", label: "Leads", icon: Users },
  { id: "pipeline", href: "/admin/pipeline", label: "Pipeline", icon: Layers },
  { id: "calendar", href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { id: "emails", href: "/admin/emails", label: "Emails", icon: Mail },
  { id: "kpi", href: "/admin/kpi", label: "My KPI", icon: BarChart3 },
];

// Grouped nav for admins (streamlined)
const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    key: "sales",
    label: "Sales",
    icon: FolderKanban,
    items: [
      { id: "leads", href: "/admin/leads", label: "Leads", icon: Users },
      { id: "pipeline", href: "/admin/pipeline", label: "Pipeline", icon: Layers },
    ],
  },
  {
    key: "training",
    label: "Training",
    icon: GraduationCap,
    items: [
      { id: "students", href: "/admin/students", label: "Students", icon: Users },
      { id: "batches", href: "/admin/batches", label: "Batches", icon: Layers },
      { id: "sessions", href: "/admin/sessions", label: "Sessions", icon: BookOpen },
      { id: "certificates", href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: UsersRound,
    items: [
      { id: "team-activity", href: "/admin/team-activity", label: "Activity", icon: Activity },
      { id: "kpi", href: "/admin/kpi", label: "KPI", icon: BarChart3 },
      { id: "employees", href: "/admin/employees", label: "Employees", icon: Users },
      { id: "reports", href: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    key: "more",
    label: "More",
    icon: Database,
    items: [
      { id: "invoices", href: "/admin/invoices", label: "Invoices", icon: FileText },
      { id: "emails", href: "/admin/emails", label: "Emails", icon: Mail },
      { id: "calendar", href: "/admin/calendar", label: "Calendar", icon: Calendar },
      { id: "drip-campaigns", href: "/admin/drip-campaigns", label: "Campaigns", icon: Send },
    ],
  },
  {
    key: "system",
    label: "System",
    icon: Cog,
    items: [
      { id: "monitoring", href: "/admin/monitoring", label: "Monitoring", icon: Monitor },
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
const COLLAPSED_STORAGE_KEY = "edw-sidebar-collapsed";

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

function loadCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
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
  const [collapsed, setCollapsed] = useState(false);

  const allowedIds = useMemo(() => getNavItemsForRole(userRole), [userRole]);
  const isAgent = userRole === "SALES_LEAD" || userRole === "ADMISSION_COUNSELLOR";

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setCollapsed(loadCollapsed());
  }, []);

  // Filter groups: only show groups that have at least one visible item (admin/super_admin only)
  const visibleGroups = useMemo(() => {
    if (isAgent) return [];
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => allowedIds.includes(item.id)),
    })).filter((group) => group.items.length > 0);
  }, [allowedIds, isAgent]);

  const showDashboard = !isAgent && allowedIds.includes("dashboard");

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

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      saveCollapsed(next);
      // Close user menu when collapsing
      if (next) setShowUserMenu(false);
      return next;
    });
  }, []);

  // --- EXPANDED sidebar content (also used for mobile) ---
  const expandedContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/[0.06]">
        <Image
          src="/images/EDWARTENS ICON Transparent.png"
          alt="EDWartens UK Logo"
          width={30}
          height={30}
          className="rounded-md sidebar-logo"
        />
        <div>
          <h1 className="text-xs font-semibold text-text-primary leading-tight">
            EDWartens UK
          </h1>
          <p className="text-[10px] text-text-muted">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {isAgent ? (
          /* Agent flat nav — no groups, just clean links */
          AGENT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </Link>
          ))
        ) : (
          <>
            {/* Dashboard - always top level for admins */}
            {showDashboard && (
              <Link
                href={DASHBOARD_ITEM.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive(DASHBOARD_ITEM.href) ? "active" : ""}`}
              >
                <LayoutDashboard size={15} />
                <span>{DASHBOARD_ITEM.label}</span>
              </Link>
            )}

            {/* Grouped nav items for admins */}
            {visibleGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.key);
              const GroupIcon = group.icon;
              const hasActiveChild = group.items.some((item) => isActive(item.href));

              return (
                <div key={group.key} className="mt-1.5">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      hasActiveChild
                        ? "text-neon-blue/80"
                        : "text-text-muted hover:text-text-secondary"
                    } hover:bg-white/[0.03]`}
                  >
                    <GroupIcon size={12} className="shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    {isExpanded ? (
                      <ChevronDown size={12} className="shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="shrink-0" />
                    )}
                  </button>

                  {/* Group items */}
                  {isExpanded && (
                    <div className="mt-0.5 space-y-px">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`sidebar-link pl-7 ${active ? "active" : ""}`}
                          >
                            <Icon size={14} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
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
              <form action="/api/logout" method="POST">
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

  // --- COLLAPSED sidebar content (desktop only) ---
  const collapsedContent = (
    <>
      {/* Logo - icon only */}
      <div className="flex items-center justify-center px-2 py-6 border-b border-white/[0.06]">
        <Image
          src="/images/EDWARTENS ICON Transparent.png"
          alt="EDWartens UK Logo"
          width={36}
          height={36}
          className="rounded-lg sidebar-logo"
        />
      </div>

      {/* Navigation - icons only with tooltips */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {isAgent ? (
          /* Agent flat nav — collapsed: icon-only with tooltips */
          AGENT_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${
                  active
                    ? "bg-white/[0.04] border-l-2 border-l-[#7BC142] text-white"
                    : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
                }`}
              >
                <Icon size={16} />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.08] text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                  {item.label}
                </span>
              </Link>
            );
          })
        ) : (
          <>
            {/* Dashboard */}
            {showDashboard && (
              <Link
                href={DASHBOARD_ITEM.href}
                className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${
                  isActive(DASHBOARD_ITEM.href)
                    ? "bg-white/[0.04] border-l-2 border-l-[#7BC142] text-white"
                    : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
                }`}
              >
                <LayoutDashboard size={15} />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.08] text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                  {DASHBOARD_ITEM.label}
                </span>
              </Link>
            )}

            {/* Grouped nav items - collapsed: show group icon as divider, then child icons */}
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              const hasActiveChild = group.items.some((item) => isActive(item.href));

              return (
                <div key={group.key} className="mt-3">
                  {/* Group icon as centered divider with tooltip */}
                  <div
                    className={`group relative flex items-center justify-center w-full h-8 text-[11px] ${
                      hasActiveChild ? "text-neon-blue/80" : "text-text-muted"
                    }`}
                  >
                    <GroupIcon size={14} />
                    <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.08] text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                      {group.label}
                    </span>
                  </div>

                  {/* Child items - always visible in collapsed mode (icons only) */}
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group relative flex items-center justify-center w-full h-9 rounded-lg transition-colors ${
                            active
                              ? "bg-white/[0.04] border-l-2 border-l-[#7BC142] text-white"
                              : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
                          }`}
                        >
                          <Icon size={16} />
                          {/* Tooltip */}
                          <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.08] text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* User section - collapsed: avatar only with system dropdown opening to the right */}
      <div className="border-t border-white/[0.06] p-2 relative">
        {/* System menu dropdown (opens to the right in collapsed mode) */}
        {showUserMenu && (
          <div className="absolute bottom-0 left-full ml-2 w-52 rounded-xl border border-white/[0.08] bg-[#0c1018] shadow-2xl overflow-hidden z-50">
            {SYSTEM_ITEMS.filter((item) => allowedIds.includes(item.id)).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => { setShowUserMenu(false); }}
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
              <form action="/api/logout" method="POST">
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
          className="group relative flex items-center justify-center w-full h-10 rounded-lg hover:bg-white/[0.03] transition-colors"
        >
          {userImage ? (
            <Image src={userImage} alt={userName} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-medium text-neon-blue">
              {getInitials(userName)}
            </div>
          )}
          {/* Tooltip */}
          {!showUserMenu && (
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0c1018] border border-white/[0.08] text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
              {userName}
            </span>
          )}
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

      {/* Mobile sidebar - always full width, unchanged behavior */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-40
          w-64 flex flex-col
          bg-dark-secondary/95 backdrop-blur-xl
          border-r border-white/[0.06]
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {expandedContent}
      </aside>

      {/* Desktop sidebar - collapsible */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          bg-dark-secondary/95 backdrop-blur-xl
          border-r border-white/[0.06]
          transition-all duration-200 ease-in-out
          ${collapsed ? "w-14" : "w-52"}
          relative
        `}
      >
        {collapsed ? collapsedContent : expandedContent}

        {/* Collapse/Expand toggle button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 bottom-20 w-6 h-6 rounded-full bg-dark-secondary border border-white/[0.1] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors z-50 shadow-lg"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

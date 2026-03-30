"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  PlayCircle,
  TrendingUp,
  CalendarCheck,
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
  MessageSquare,
  PenTool,
  Users,
  Newspaper,
  Gift,
  Settings,
  Wrench,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Hammer,
  BriefcaseBusiness,
  CircleUser,
} from "lucide-react";

interface StudentSidebarProps {
  userName: string;
  userEmail: string;
  onboarded: boolean;
}

interface NavItem {
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
  href: "/student/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: "course",
    label: "My Course",
    icon: BookOpen,
    items: [
      { href: "/student/sessions", label: "Sessions", icon: PlayCircle },
      { href: "/student/progress", label: "Progress", icon: TrendingUp },
      { href: "/student/assessments", label: "Assessments", icon: ClipboardCheck },
      { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/student/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    key: "career",
    label: "Career",
    icon: BriefcaseBusiness,
    items: [
      { href: "/student/resume", label: "Resume & CV", icon: File },
      { href: "/student/jobs", label: "Jobs", icon: Briefcase },
      { href: "/student/alumni", label: "Alumni Network", icon: Users },
      { href: "/student/referrals", label: "Refer & Earn", icon: Gift },
    ],
  },
  {
    key: "account",
    label: "My Account",
    icon: CircleUser,
    items: [
      { href: "/student/documents", label: "Documents", icon: FileText },
      { href: "/student/payments", label: "Payments & Invoices", icon: CreditCard },
      { href: "/student/profile", label: "Profile", icon: User },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/student/support", label: "Support", icon: HelpCircle },
  { href: "/student/settings", label: "Settings", icon: Settings },
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

export default function StudentSidebar({
  userName,
  userEmail,
  onboarded,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const isActive = (href: string) => {
    if (href === "/student/dashboard") {
      return pathname === "/student" || pathname === "/student/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Auto-expand the group containing the active page
  useEffect(() => {
    const stored = loadExpandedGroups();
    const activeGroupKey = NAV_GROUPS.find((group) =>
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
      <div className="p-4 border-b border-border">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/EDWARTENS ICON Transparent.png"
            alt="EDWartens UK Logo"
            width={32}
            height={32}
            className="rounded sidebar-logo"
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
          <>
            {/* Dashboard - always top level */}
            <Link
              href={DASHBOARD_ITEM.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive(DASHBOARD_ITEM.href) ? "active" : ""}`}
            >
              <LayoutDashboard size={18} />
              <span>{DASHBOARD_ITEM.label}</span>
            </Link>

            {/* Grouped nav items */}
            {NAV_GROUPS.map((group) => {
              const isExpanded = expandedGroups.includes(group.key);
              const GroupIcon = group.icon;
              const hasActiveChild = group.items.some((item) =>
                isActive(item.href)
              );

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

            {/* Bottom standalone items */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              {BOTTOM_ITEMS.map((item) => {
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
            </div>
          </>
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

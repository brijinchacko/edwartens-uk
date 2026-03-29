import type { Metadata } from "next";
import { Settings, Building2, BarChart3, Bell, Plug, Users } from "lucide-react";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | EDWartens Admin",
  description: "System settings and configuration",
};

const quickLinks = [
  {
    title: "Company Settings",
    description: "Company name, contact details, VAT and registration",
    icon: Building2,
    color: "text-neon-blue bg-neon-blue/10",
    tab: "general",
  },
  {
    title: "CRM Settings",
    description: "Lead defaults, course fees, batch configuration",
    icon: BarChart3,
    color: "text-neon-green bg-neon-green/10",
    tab: "crm",
  },
  {
    title: "Notification Settings",
    description: "Email and alert preferences for events",
    icon: Bell,
    color: "text-yellow-400 bg-yellow-400/10",
    tab: "notifications",
  },
  {
    title: "Integration Settings",
    description: "Zoho, Freshsales, Stripe, Resend connections",
    icon: Plug,
    color: "text-purple bg-purple/10",
    tab: "integrations",
  },
  {
    title: "User Management",
    description: "Manage admin users, roles and permissions",
    icon: Users,
    color: "text-cyan-400 bg-cyan-400/10",
    tab: "general",
    href: "/admin/users",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Settings size={24} className="text-neon-blue" />
            Settings
          </h1>
          <p className="text-text-muted mt-1">
            System configuration and preferences
          </p>
        </div>
      </div>

      {/* Quick-link cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.title}
              className="glass-card p-4 flex items-start gap-3"
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${link.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold text-sm">
                  {link.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {link.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main settings client component */}
      <SettingsClient />
    </div>
  );
}

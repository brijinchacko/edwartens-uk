import type { Metadata } from "next";
import { Settings, Globe, Bell, Shield, Database, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | EDWartens Admin",
  description: "System settings and configuration",
};

const settingsSections = [
  {
    title: "General",
    description: "Company name, logo, contact details",
    icon: Globe,
    color: "text-neon-blue bg-neon-blue/10",
  },
  {
    title: "Notifications",
    description: "Email templates, SMS settings, notification preferences",
    icon: Bell,
    color: "text-yellow-400 bg-yellow-400/10",
  },
  {
    title: "Security",
    description: "Password policies, 2FA settings, session management",
    icon: Shield,
    color: "text-red-400 bg-red-400/10",
  },
  {
    title: "Database",
    description: "Backup settings, data export, maintenance",
    icon: Database,
    color: "text-green-400 bg-green-400/10",
  },
  {
    title: "Appearance",
    description: "Theme, branding, portal customization",
    icon: Palette,
    color: "text-purple bg-purple/10",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">
          System configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="glass-card p-5 flex items-start gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <div className={`p-3 rounded-lg shrink-0 ${section.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">
                  {section.title}
                </h3>
                <p className="text-sm text-text-muted mt-0.5">
                  {section.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder content */}
      <div className="glass-card p-8 text-center">
        <Settings
          size={40}
          className="text-text-muted mx-auto mb-3 animate-spin"
          style={{ animationDuration: "8s" }}
        />
        <h2 className="text-lg font-semibold text-text-primary">
          Settings Coming Soon
        </h2>
        <p className="text-text-muted mt-2 max-w-md mx-auto">
          The settings panel is under development. Configuration options will be
          available in an upcoming release.
        </p>
      </div>
    </div>
  );
}

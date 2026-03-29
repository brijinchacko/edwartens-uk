"use client";

import { useState } from "react";
import {
  Building2,
  BarChart3,
  Bell,
  Plug,
  Palette,
  Sun,
  Moon,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Hash,
  ChevronRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  CircleDot,
  Zap,
  CreditCard,
  Send,
  GraduationCap,
  Users,
  Clock,
  PoundSterling,
  Percent,
  Layers,
  Monitor,
  AlertCircle,
  BookOpen,
  Award,
  Upload,
  ClipboardCheck,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "appearance" | "general" | "crm" | "notifications" | "integrations";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const tabs: TabDef[] = [
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "general", label: "General", icon: Building2 },
  { key: "crm", label: "CRM", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "integrations", label: "Integrations", icon: Plug },
];

// ---------------------------------------------------------------------------
// Default CRM settings (in-memory for now)
// ---------------------------------------------------------------------------

const defaultCrmSettings = {
  defaultLeadStatus: "NEW" as string,
  defaultLeadSource: "website" as string,
  autoAssignLeads: false,
  autoAssignCounsellor: "" as string,
  followUpReminderDays: 3,
  defaultBatchCapacity: 6,
  defaultBatchMode: "ONLINE" as string,
  courseFeeProfessional: 2140,
  courseFeeAI: 4500,
  vatRate: 20,
  depositAmount: 100,
};

const defaultNotifications = {
  emailNotifications: true,
  newLead: true,
  paymentReceived: true,
  documentUploaded: true,
  certificateGenerated: true,
  assessmentCompleted: true,
};

// ---------------------------------------------------------------------------
// Reusable micro-components
// ---------------------------------------------------------------------------

function SectionHeading({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-text-primary">{children}</h3>
      {description && (
        <p className="text-sm text-text-muted mt-0.5">{description}</p>
      )}
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-2 sm:w-56 shrink-0">
        <Icon size={15} className="text-text-muted" />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ReadOnlyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-primary">{value}</span>
      <button
        onClick={copy}
        className="text-text-muted hover:text-neon-blue transition-colors"
        title="Copy"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors w-full sm:max-w-xs"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#141C26]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {prefix && (
        <span className="text-sm text-text-muted">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm rounded-lg px-3 py-2 w-28 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
      />
      {suffix && (
        <span className="text-sm text-text-muted">{suffix}</span>
      )}
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 group"
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
          enabled ? "bg-neon-blue" : "bg-white/10"
        }`}
        style={{ width: 40, height: 22 }}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
            enabled ? "translate-x-[18px]" : "translate-x-0"
          }`}
          style={{ width: 18, height: 18 }}
        />
      </div>
      {label && (
        <span className="text-sm text-text-primary group-hover:text-neon-blue transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}

function MaskedKey({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const masked = value.slice(0, 6) + "****" + value.slice(-4);
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs text-text-primary bg-white/[0.04] px-2 py-1 rounded font-mono">
        {visible ? value : masked}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="text-text-muted hover:text-neon-blue transition-colors"
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function IntegrationCard({
  name,
  icon: Icon,
  iconColor,
  connected,
  apiKey,
  lastSync,
  extra,
}: {
  name: string;
  icon: React.ElementType;
  iconColor: string;
  connected: boolean;
  apiKey?: string;
  lastSync?: string;
  extra?: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-text-primary font-semibold">{name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span
                className={`text-xs ${
                  connected ? "text-green-400" : "text-red-400"
                }`}
              >
                {connected ? "Connected" : "Not Connected"}
              </span>
            </div>
          </div>
        </div>
        <button className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors flex items-center gap-1">
          Configure
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="space-y-2.5">
        {apiKey && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">API Key</span>
            <MaskedKey value={apiKey} />
          </div>
        )}
        {lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Last Sync</span>
            <span className="text-xs text-text-primary">{lastSync}</span>
          </div>
        )}
        {extra && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Account</span>
            <span className="text-xs text-text-primary">{extra}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accent presets
// ---------------------------------------------------------------------------

const ACCENT_PRESETS = [
  { label: "Blue", hex: "#2891FF" },
  { label: "Green", hex: "#22C55E" },
  { label: "Purple", hex: "#7C3AED" },
  { label: "Orange", hex: "#F97316" },
  { label: "Red", hex: "#EF4444" },
  { label: "Teal", hex: "#14B8A6" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Amber", hex: "#F59E0B" },
];

// ---------------------------------------------------------------------------
// Tab Panels
// ---------------------------------------------------------------------------

function AppearanceTab() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [customHex, setCustomHex] = useState(accent);
  const isPreset = ACCENT_PRESETS.some((p) => p.hex === accent);

  const handleCustomHex = (val: string) => {
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setAccent(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <div className="glass-card p-6">
        <SectionHeading description="Choose between dark and light interface modes">
          Theme Mode
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Dark mode card */}
          <button
            onClick={() => setTheme("dark")}
            className={`relative rounded-xl border-2 p-4 transition-all text-left ${
              theme === "dark"
                ? "border-neon-blue bg-neon-blue/5"
                : "border-white/[0.08] hover:border-white/20"
            }`}
          >
            {theme === "dark" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-neon-blue flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/[0.06]">
                <Moon size={18} className="text-neon-blue" />
              </div>
              <span className="font-semibold text-text-primary">Dark Mode</span>
            </div>
            {/* Mini preview */}
            <div className="rounded-lg overflow-hidden border border-white/[0.08]">
              <div className="bg-[#0A0F14] p-3 space-y-2">
                <div className="h-2 w-16 rounded bg-white/20" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded bg-white/[0.06] border border-white/[0.08]" />
                  <div className="h-8 flex-1 rounded bg-white/[0.06] border border-white/[0.08]" />
                </div>
                <div className="h-2 w-24 rounded bg-white/10" />
              </div>
            </div>
          </button>

          {/* Light mode card */}
          <button
            onClick={() => setTheme("light")}
            className={`relative rounded-xl border-2 p-4 transition-all text-left ${
              theme === "light"
                ? "border-neon-blue bg-neon-blue/5"
                : "border-white/[0.08] hover:border-white/20"
            }`}
          >
            {theme === "light" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-neon-blue flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/[0.06]">
                <Sun size={18} className="text-amber-400" />
              </div>
              <span className="font-semibold text-text-primary">Light Mode</span>
            </div>
            {/* Mini preview */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-[#f5f7fa] p-3 space-y-2">
                <div className="h-2 w-16 rounded bg-gray-300" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded bg-white border border-gray-200 shadow-sm" />
                  <div className="h-8 flex-1 rounded bg-white border border-gray-200 shadow-sm" />
                </div>
                <div className="h-2 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="glass-card p-6">
        <SectionHeading description="Personalise the admin portal with your preferred accent colour">
          Accent Colour
        </SectionHeading>

        <div className="space-y-5">
          {/* Preset grid */}
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((preset) => {
              const active = accent === preset.hex;
              return (
                <button
                  key={preset.hex}
                  onClick={() => {
                    setAccent(preset.hex);
                    setCustomHex(preset.hex);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    active
                      ? "border-current bg-white/[0.06]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                  style={{ color: active ? preset.hex : undefined }}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-transparent"
                    style={{
                      backgroundColor: preset.hex,
                      boxShadow: active
                        ? `0 0 0 2px ${preset.hex}`
                        : "none",
                    }}
                  />
                  <span className="text-sm text-text-primary">{preset.label}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>

          {/* Custom hex input */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-muted whitespace-nowrap">
              Custom:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => {
                  setAccent(e.target.value);
                  setCustomHex(e.target.value);
                }}
                className="w-8 h-8 rounded cursor-pointer border border-white/[0.08] bg-transparent"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleCustomHex(e.target.value)}
                placeholder="#2891FF"
                maxLength={7}
                className="bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm rounded-lg px-3 py-2 w-28 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors font-mono"
              />
            </div>
            {!isPreset && /^#[0-9A-Fa-f]{6}$/.test(accent) && (
              <span className="text-xs text-text-muted">(custom)</span>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="glass-card p-6">
        <SectionHeading description="See how your current settings will look">
          Preview
        </SectionHeading>

        <div
          className={`rounded-xl p-5 border space-y-4 transition-colors ${
            theme === "dark"
              ? "bg-[#0A0F14] border-white/[0.08]"
              : "bg-[#f5f7fa] border-gray-200"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div
              className="text-sm font-semibold"
              style={{ color: accent }}
            >
              EDWartens Admin
            </div>
            <div className="flex gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <div
                className="h-2 w-2 rounded-full opacity-50"
                style={{ backgroundColor: accent }}
              />
              <div
                className="h-2 w-2 rounded-full opacity-25"
                style={{ backgroundColor: accent }}
              />
            </div>
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${
                  theme === "dark"
                    ? "bg-white/[0.04] border border-white/[0.06]"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <div
                  className="h-1.5 w-8 rounded mb-2"
                  style={{ backgroundColor: accent, opacity: 0.7 + i * 0.1 }}
                />
                <div
                  className={`h-1.5 w-12 rounded ${
                    theme === "dark" ? "bg-white/10" : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Button preview */}
          <div className="flex gap-2">
            <div
              className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: accent }}
            >
              Primary Action
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{
                borderColor: accent,
                color: accent,
                backgroundColor:
                  theme === "dark"
                    ? `${accent}15`
                    : `${accent}10`,
              }}
            >
              Secondary
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-4 border-neon-blue/20 bg-neon-blue/[0.03]">
        <div className="flex items-start gap-3">
          <Palette size={16} className="text-neon-blue mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-text-primary font-medium">
              Preferences saved automatically
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Theme and accent colour settings are stored locally in your browser
              and applied instantly. They do not affect other users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <SectionHeading description="Read-only company registration details">
          Company Information
        </SectionHeading>

        <div className="space-y-0">
          <FieldRow icon={Building2} label="Company Name">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary font-medium">
                EDWartens UK / Wartens Ltd
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue font-medium uppercase tracking-wider">
                Verified
              </span>
            </div>
          </FieldRow>

          <FieldRow icon={Mail} label="Email">
            <ReadOnlyValue value="info@wartens.com" />
          </FieldRow>

          <FieldRow icon={Phone} label="Phone">
            <ReadOnlyValue value="+44 333 33 98 394" />
          </FieldRow>

          <FieldRow icon={MapPin} label="Address">
            <ReadOnlyValue value="8 Lyon Road, Milton Keynes, MK1 1EX" />
          </FieldRow>

          <FieldRow icon={Globe} label="Website">
            <a
              href="https://edwartens.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neon-blue hover:underline flex items-center gap-1"
            >
              edwartens.co.uk
              <ExternalLink size={12} />
            </a>
          </FieldRow>

          <FieldRow icon={FileText} label="VAT Number">
            <ReadOnlyValue value="473020522" />
          </FieldRow>

          <FieldRow icon={Hash} label="CRN">
            <ReadOnlyValue value="15262249" />
          </FieldRow>
        </div>
      </div>

      {/* Quick links */}
      <div className="glass-card p-6">
        <SectionHeading description="Quick access to management pages">
          User Management
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-neon-blue/30 hover:bg-white/[0.04] transition-all group"
          >
            <Users size={16} className="text-neon-blue" />
            <div>
              <span className="text-sm text-text-primary group-hover:text-neon-blue transition-colors">
                Manage Users
              </span>
              <p className="text-xs text-text-muted">
                Admin accounts and permissions
              </p>
            </div>
            <ChevronRight
              size={14}
              className="ml-auto text-text-muted group-hover:text-neon-blue transition-colors"
            />
          </a>
          <a
            href="/admin/leads"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-neon-blue/30 hover:bg-white/[0.04] transition-all group"
          >
            <GraduationCap size={16} className="text-neon-green" />
            <div>
              <span className="text-sm text-text-primary group-hover:text-neon-blue transition-colors">
                Manage Leads
              </span>
              <p className="text-xs text-text-muted">
                View and manage all leads
              </p>
            </div>
            <ChevronRight
              size={14}
              className="ml-auto text-text-muted group-hover:text-neon-blue transition-colors"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

function CrmTab() {
  const [settings, setSettings] = useState(defaultCrmSettings);

  const update = <K extends keyof typeof defaultCrmSettings>(
    key: K,
    value: (typeof defaultCrmSettings)[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Lead Defaults */}
      <div className="glass-card p-6">
        <SectionHeading description="Default values applied when new leads are created">
          Lead Defaults
        </SectionHeading>

        <div className="space-y-0">
          <FieldRow icon={CircleDot} label="Default Lead Status">
            <SelectInput
              value={settings.defaultLeadStatus}
              onChange={(v) => update("defaultLeadStatus", v)}
              options={[
                { label: "New", value: "NEW" },
                { label: "Contacted", value: "CONTACTED" },
                { label: "Qualified", value: "QUALIFIED" },
              ]}
            />
          </FieldRow>

          <FieldRow icon={Zap} label="Default Lead Source">
            <SelectInput
              value={settings.defaultLeadSource}
              onChange={(v) => update("defaultLeadSource", v)}
              options={[
                { label: "Website", value: "website" },
                { label: "Phone", value: "phone" },
                { label: "Email", value: "email" },
                { label: "Referral", value: "referral" },
                { label: "Social Media", value: "social_media" },
              ]}
            />
          </FieldRow>

          <FieldRow icon={Users} label="Auto-assign Leads">
            <div className="flex flex-col gap-2.5">
              <Toggle
                enabled={settings.autoAssignLeads}
                onToggle={() =>
                  update("autoAssignLeads", !settings.autoAssignLeads)
                }
                label={settings.autoAssignLeads ? "Enabled" : "Disabled"}
              />
              {settings.autoAssignLeads && (
                <SelectInput
                  value={settings.autoAssignCounsellor}
                  onChange={(v) => update("autoAssignCounsellor", v)}
                  options={[
                    { label: "Select counsellor...", value: "" },
                    { label: "Brijin Chacko", value: "brijin" },
                    { label: "Admin User", value: "admin" },
                  ]}
                />
              )}
            </div>
          </FieldRow>

          <FieldRow icon={Clock} label="Follow-up Reminder">
            <NumberInput
              value={settings.followUpReminderDays}
              onChange={(v) => update("followUpReminderDays", v)}
              suffix="days"
              min={1}
              max={30}
            />
          </FieldRow>
        </div>
      </div>

      {/* Batch Defaults */}
      <div className="glass-card p-6">
        <SectionHeading description="Default configuration for new batches">
          Batch Configuration
        </SectionHeading>

        <div className="space-y-0">
          <FieldRow icon={Layers} label="Default Capacity">
            <NumberInput
              value={settings.defaultBatchCapacity}
              onChange={(v) => update("defaultBatchCapacity", v)}
              suffix="students"
              min={1}
              max={50}
            />
          </FieldRow>

          <FieldRow icon={Monitor} label="Default Mode">
            <SelectInput
              value={settings.defaultBatchMode}
              onChange={(v) => update("defaultBatchMode", v)}
              options={[
                { label: "Online", value: "ONLINE" },
                { label: "Offline", value: "OFFLINE" },
                { label: "Hybrid", value: "HYBRID" },
              ]}
            />
          </FieldRow>
        </div>
      </div>

      {/* Fees & Pricing */}
      <div className="glass-card p-6">
        <SectionHeading description="Course fees, VAT and deposit configuration">
          Fees & Pricing
        </SectionHeading>

        <div className="space-y-0">
          <FieldRow icon={PoundSterling} label="Professional Module Fee">
            <NumberInput
              value={settings.courseFeeProfessional}
              onChange={(v) => update("courseFeeProfessional", v)}
              prefix="\u00a3"
              min={0}
            />
          </FieldRow>

          <FieldRow icon={PoundSterling} label="AI Module Fee">
            <NumberInput
              value={settings.courseFeeAI}
              onChange={(v) => update("courseFeeAI", v)}
              prefix="\u00a3"
              min={0}
            />
          </FieldRow>

          <FieldRow icon={Percent} label="VAT Rate">
            <NumberInput
              value={settings.vatRate}
              onChange={(v) => update("vatRate", v)}
              suffix="%"
              min={0}
              max={100}
            />
          </FieldRow>

          <FieldRow icon={PoundSterling} label="Deposit Amount">
            <NumberInput
              value={settings.depositAmount}
              onChange={(v) => update("depositAmount", v)}
              prefix="\u00a3"
              min={0}
            />
          </FieldRow>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="px-5 py-2.5 bg-neon-blue hover:bg-neon-blue/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Check size={16} />
          Save CRM Settings
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState(defaultNotifications);

  const toggle = (key: keyof typeof defaultNotifications) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <SectionHeading description="Control which events trigger notifications">
          Email Notifications
        </SectionHeading>

        <div className="space-y-0">
          <FieldRow icon={Mail} label="Email Notifications">
            <Toggle
              enabled={notifs.emailNotifications}
              onToggle={() => toggle("emailNotifications")}
              label={notifs.emailNotifications ? "Enabled" : "Disabled"}
            />
          </FieldRow>

          {notifs.emailNotifications && (
            <>
              <div className="py-2.5 border-b border-white/[0.06]">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium pl-1">
                  Event Triggers
                </p>
              </div>

              <FieldRow icon={AlertCircle} label="New Lead Created">
                <Toggle
                  enabled={notifs.newLead}
                  onToggle={() => toggle("newLead")}
                  label={notifs.newLead ? "On" : "Off"}
                />
              </FieldRow>

              <FieldRow icon={CreditCard} label="Payment Received">
                <Toggle
                  enabled={notifs.paymentReceived}
                  onToggle={() => toggle("paymentReceived")}
                  label={notifs.paymentReceived ? "On" : "Off"}
                />
              </FieldRow>

              <FieldRow icon={Upload} label="Document Uploaded">
                <Toggle
                  enabled={notifs.documentUploaded}
                  onToggle={() => toggle("documentUploaded")}
                  label={notifs.documentUploaded ? "On" : "Off"}
                />
              </FieldRow>

              <FieldRow icon={Award} label="Certificate Generated">
                <Toggle
                  enabled={notifs.certificateGenerated}
                  onToggle={() => toggle("certificateGenerated")}
                  label={notifs.certificateGenerated ? "On" : "Off"}
                />
              </FieldRow>

              <FieldRow icon={ClipboardCheck} label="Assessment Completed">
                <Toggle
                  enabled={notifs.assessmentCompleted}
                  onToggle={() => toggle("assessmentCompleted")}
                  label={notifs.assessmentCompleted ? "On" : "Off"}
                />
              </FieldRow>
            </>
          )}
        </div>
      </div>

      {/* Info banner */}
      {!notifs.emailNotifications && (
        <div className="glass-card p-4 border-yellow-400/20 bg-yellow-400/[0.03]">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-yellow-400 font-medium">
                Notifications Disabled
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                You will not receive any email notifications for CRM events.
                Enable the master toggle above to configure individual alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button className="px-5 py-2.5 bg-neon-blue hover:bg-neon-blue/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Check size={16} />
          Save Notification Preferences
        </button>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <SectionHeading description="External services connected to the CRM">
          Connected Services
        </SectionHeading>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            name="Zoho CRM"
            icon={BookOpen}
            iconColor="text-red-400 bg-red-400/10"
            connected={true}
            apiKey="zoho_crm_1a2b3c4d5e6f7g8h9i0j"
            lastSync="29 Mar 2026, 08:15 AM"
          />

          <IntegrationCard
            name="Freshsales"
            icon={BarChart3}
            iconColor="text-green-400 bg-green-400/10"
            connected={false}
            apiKey="fs_tok_abc123def456ghi789jkl0"
            lastSync="Never"
          />

          <IntegrationCard
            name="Stripe"
            icon={CreditCard}
            iconColor="text-purple bg-purple/10"
            connected={true}
            extra="acct_edwartens_uk"
            lastSync="29 Mar 2026, 09:00 AM"
          />

          <IntegrationCard
            name="Resend (Email)"
            icon={Send}
            iconColor="text-neon-blue bg-neon-blue/10"
            connected={true}
            apiKey="re_abc1234567890defghijklm"
            lastSync="29 Mar 2026, 07:45 AM"
          />
        </div>
      </div>

      {/* Sync status summary */}
      <div className="glass-card p-6">
        <SectionHeading description="Overview of data synchronization across integrations">
          Sync Status
        </SectionHeading>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left text-text-muted font-medium py-2 pr-4">
                  Service
                </th>
                <th className="text-left text-text-muted font-medium py-2 pr-4">
                  Status
                </th>
                <th className="text-left text-text-muted font-medium py-2 pr-4">
                  Last Sync
                </th>
                <th className="text-left text-text-muted font-medium py-2">
                  Records
                </th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              <tr className="border-b border-white/[0.06]">
                <td className="py-2.5 pr-4">Zoho CRM</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 text-green-400 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Synced
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-text-muted">
                  29 Mar 2026, 08:15
                </td>
                <td className="py-2.5">142 contacts</td>
              </tr>
              <tr className="border-b border-white/[0.06]">
                <td className="py-2.5 pr-4">Freshsales</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 text-red-400 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Disconnected
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-text-muted">Never</td>
                <td className="py-2.5">-</td>
              </tr>
              <tr className="border-b border-white/[0.06]">
                <td className="py-2.5 pr-4">Stripe</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 text-green-400 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Active
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-text-muted">
                  29 Mar 2026, 09:00
                </td>
                <td className="py-2.5">87 payments</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">Resend</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 text-green-400 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Active
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-text-muted">
                  29 Mar 2026, 07:45
                </td>
                <td className="py-2.5">1,204 emails</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("appearance");

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="glass-card p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-neon-blue/15 text-neon-blue"
                  : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "appearance" && <AppearanceTab />}
      {activeTab === "general" && <GeneralTab />}
      {activeTab === "crm" && <CrmTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "integrations" && <IntegrationsTab />}
    </div>
  );
}

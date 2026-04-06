"use client";

import { useState, useEffect, useCallback } from "react";
import { Cookie, X, Shield, BarChart3, Megaphone, Settings } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const EU_LANG_PREFIXES = [
  "de", "fr", "nl", "pl", "it", "es", "pt", "sv", "da", "fi",
  "no", "cs", "hu", "ro", "el", "bg", "hr", "sk", "sl", "et",
  "lv", "lt", "mt", "ga",
];

function isEUUser(): boolean {
  if (typeof navigator === "undefined") return false;
  const lang = navigator.language?.toLowerCase() || "";
  return EU_LANG_PREFIXES.some((prefix) => lang.startsWith(prefix));
}

function getStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem("edw-cookie-consent");
    if (!raw) return null;
    // Handle legacy format
    if (raw === "accepted") {
      return { necessary: true, analytics: true, marketing: true };
    }
    if (raw === "declined") {
      return { necessary: true, analytics: false, marketing: false };
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveConsent(prefs: CookiePreferences) {
  localStorage.setItem("edw-cookie-consent", JSON.stringify(prefs));
  // Dispatch custom event so GoogleAnalytics component can react
  window.dispatchEvent(new Event("edw-consent-updated"));
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isEU, setIsEU] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setIsEU(isEUUser());
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(consent);
    setShow(false);
    setShowPreferences(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    const consent: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(consent);
    setShow(false);
    setShowPreferences(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsent({ ...prefs, necessary: true });
    setShow(false);
    setShowPreferences(false);
  }, [prefs]);

  // Exposed globally so the footer "Cookie Settings" link can reopen this
  useEffect(() => {
    const handler = () => {
      const stored = getStoredConsent();
      if (stored) {
        setPrefs(stored);
      }
      setShow(true);
      setShowPreferences(true);
    };
    window.addEventListener("edw-open-cookie-settings", handler);
    window.addEventListener("open-cookie-settings", handler);
    return () => {
      window.removeEventListener("edw-open-cookie-settings", handler);
      window.removeEventListener("open-cookie-settings", handler);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      {/* Overlay for preferences modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[61] bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPreferences(false)}
        />
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[62] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1f2e] border border-white/10 shadow-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Settings size={18} className="text-neon-blue" />
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isEU && (
              <div className="rounded-lg bg-neon-blue/5 border border-neon-blue/10 px-3 py-2 mb-4">
                <p className="text-[11px] text-neon-blue leading-relaxed">
                  Under GDPR (EU), you have the right to choose which cookies are
                  used. Non-essential cookies are off by default.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {/* Necessary */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-neon-green" />
                  <div>
                    <p className="text-sm font-medium text-white">Necessary</p>
                    <p className="text-[11px] text-text-muted">
                      Required for the site to function
                    </p>
                  </div>
                </div>
                <div className="w-10 h-5 rounded-full bg-neon-green/20 flex items-center px-0.5 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-neon-green translate-x-[18px]" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <BarChart3 size={16} className="text-neon-blue" />
                  <div>
                    <p className="text-sm font-medium text-white">Analytics</p>
                    <p className="text-[11px] text-text-muted">
                      Help us understand how you use the site
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPrefs((p) => ({ ...p, analytics: !p.analytics }))
                  }
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                    prefs.analytics ? "bg-neon-blue/20" : "bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all ${
                      prefs.analytics
                        ? "bg-neon-blue translate-x-[18px]"
                        : "bg-text-muted translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Megaphone size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Marketing</p>
                    <p className="text-[11px] text-text-muted">
                      Personalised ads and content
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPrefs((p) => ({ ...p, marketing: !p.marketing }))
                  }
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                    prefs.marketing ? "bg-amber-400/20" : "bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all ${
                      prefs.marketing
                        ? "bg-amber-400 translate-x-[18px]"
                        : "bg-text-muted translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2.5 rounded-lg border border-white/10 text-text-secondary text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      {!showPreferences && (
        <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-lg mx-auto animate-fade-in-up">
          <div className="rounded-xl p-4 sm:p-5 bg-[#1a1f2e] border border-white/10 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                <Cookie size={20} className="text-neon-blue" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary mb-1">
                  We use cookies to improve your experience.
                </p>
                {isEU && (
                  <p className="text-[11px] text-text-muted mb-2">
                    Under GDPR, non-essential cookies require your consent.
                    Non-essential cookies are off by default.
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-4 py-2 rounded-lg border border-white/10 text-text-secondary text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-4 py-2 rounded-lg text-text-muted text-sm hover:text-white transition-colors underline underline-offset-2"
                  >
                    Manage Preferences
                  </button>
                </div>
              </div>
              <button
                onClick={handleRejectNonEssential}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

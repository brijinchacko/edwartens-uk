"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("edw-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("edw-cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("edw-cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-lg mx-auto animate-fade-in-up">
      <div className="rounded-xl p-4 sm:p-5 bg-[#1a1f2e] border border-white/10 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
            <Cookie size={20} className="text-neon-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary mb-3">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 rounded-lg border border-white/10 text-text-secondary text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
          <button onClick={handleDecline} className="text-text-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

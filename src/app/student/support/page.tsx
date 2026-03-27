"use client";

import { useState } from "react";
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

const faqs = [
  {
    question: "How do I access my recorded sessions?",
    answer:
      "Navigate to the Sessions page from the sidebar. Sessions are grouped by phase. You can watch sessions in order and track your progress automatically.",
  },
  {
    question: "When will I receive my certificates?",
    answer:
      "Certificates are issued after successful completion of all phases, assessments, and payment obligations. You can download them from the Certificates page once issued.",
  },
  {
    question: "How do I make a payment?",
    answer:
      "Go to the Payments page and click 'Make Payment'. You will be redirected to our secure Stripe payment page. We accept all major debit and credit cards.",
  },
  {
    question: "What if I fail an assessment?",
    answer:
      "If you do not pass an assessment, your instructor will provide feedback. You can retake the assessment after reviewing the relevant sessions and material.",
  },
  {
    question: "How do I update my documents?",
    answer:
      "Go to the Documents page where you can upload new files or view the status of previously uploaded documents. Rejected documents can be re-uploaded.",
  },
  {
    question: "Who should I contact for career support?",
    answer:
      "Our career support team actively sends job notifications to matching students. You can also reach out to info@wartens.com for specific career queries.",
  },
];

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!formData.subject || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/student/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSent(true);
      setFormData({ subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError("Failed to send your message. Please try again or contact us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Support</h1>
        <p className="text-sm text-text-muted mt-1">
          Get help with your learning journey
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          href="mailto:info@wartens.com"
          className="glass-card p-5 hover:bg-surface-hover transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-3">
            <Mail size={18} className="text-neon-blue" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Email</p>
          <p className="text-xs text-neon-blue group-hover:underline">
            info@wartens.com
          </p>
        </a>

        <a
          href="tel:+443333398394"
          className="glass-card p-5 hover:bg-surface-hover transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center mb-3">
            <Phone size={18} className="text-neon-green" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Phone</p>
          <p className="text-xs text-neon-green group-hover:underline">
            +44 333 33 98 394
          </p>
        </a>

        <div className="glass-card p-5">
          <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center mb-3">
            <Clock size={18} className="text-purple" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            Office Hours
          </p>
          <p className="text-xs text-text-muted">
            Mon - Fri, 9:00 AM - 6:00 PM (GMT)
          </p>
        </div>
      </div>

      {/* Office Address */}
      <div className="glass-card p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0">
          <MapPin size={18} className="text-cyan" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary mb-1">
            Office Address
          </p>
          <p className="text-xs text-text-secondary">
            EDWartens UK Ltd, Milton Keynes, United Kingdom
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
            <HelpCircle size={18} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Frequently Asked Questions
            </p>
            <p className="text-xs text-text-muted">
              Quick answers to common queries
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors"
              >
                <span className="text-sm font-medium text-text-primary pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted shrink-0 transition-transform ${
                    expandedFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-text-secondary">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
          <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
            <MessageSquare size={18} className="text-neon-green" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Send a Message
            </p>
            <p className="text-xs text-text-muted">
              We will respond within 24 hours
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
              placeholder="What do you need help with?"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary resize-none"
              placeholder="Describe your issue or question in detail..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {sent && (
            <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg text-sm text-neon-green flex items-center gap-2">
              <CheckCircle2 size={16} />
              Message sent successfully! We will get back to you soon.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={sending}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

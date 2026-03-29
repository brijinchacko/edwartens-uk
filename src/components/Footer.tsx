import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const courseLinks = [
  { label: "All Courses", href: "/courses" },
  { label: "Professional Module", href: "/courses/professional" },
  { label: "AI Module", href: "/courses/ai-module" },
  { label: "Training", href: "/training" },
  { label: "Case Studies", href: "/case-studies" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/placements" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Verify Certificate", href: "/verify" },
];

const ecosystemCompanies = [
  { name: "Wartens", href: "https://wartens.com" },
  { name: "Oscabe", href: "https://oscabe.com" },
  { name: "roboTED", href: "#" },
  { name: "3BOX AI", href: "#" },
  { name: "nxtED", href: "#" },
  { name: "IUNI", href: "#" },
  { name: "TraininginPLC", href: "https://traininginplc.com" },
  { name: "Oforo", href: "#" },
  { name: "Seekof", href: "#" },
  { name: "LADX", href: "#" },
  { name: "Partshire", href: "#" },
  { name: "WeMelt", href: "#" },
];

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ed-wartens-uk/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UC50h3bbLfdXOz9AxjHtzgdQ",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/edwartensuk/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/edwartensuk/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/WartensUK",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-primary">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-12">
        {/* Top: Logo + Tagline + Social */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Image
              src="/images/EDWARTENS LOGO UK.png"
              alt="EDWartens UK Logo"
              width={160}
              height={48}
              className="h-10 w-auto mb-2"
            />
            <p className="text-sm text-text-muted">Training Division of Wartens</p>
          </div>
          <div className="flex gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-text-muted hover:text-neon-blue hover:border-neon-blue/30 transition-colors"
                aria-label={s.name}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.06] my-6" />

        {/* Links + Contact: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Courses */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Courses</h3>
            <ul className="space-y-2">
              {courseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-neon-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-neon-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-text-secondary">
                <MapPin size={14} className="text-neon-blue mt-0.5 flex-shrink-0" />
                <a href="https://maps.app.goo.gl/rtnU2t8Wr68HZQmC6" target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue transition-colors">
                  8, Lyon Road, Milton Keynes, MK1 1EX
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone size={14} className="text-neon-blue flex-shrink-0" />
                <a href="tel:+443333398394" className="hover:text-neon-blue transition-colors">+44 333 33 98 394</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail size={14} className="text-neon-blue flex-shrink-0" />
                <a href="mailto:info@wartens.com" className="hover:text-neon-blue transition-colors">info@wartens.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock size={14} className="text-neon-blue flex-shrink-0" />
                08:30 - 17:00 Mon-Fri
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] my-6" />

        {/* Accreditation */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <a href="https://thecpdregister.com/providers/cpd-group-providers--785368" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/Accreditation/CPD-Wartens-PLC-Training-in-UK.webp"
              alt="CPD Accredited - Wartens PLC Training"
              width={120}
              height={60}
              className="h-10 w-auto rounded hover:opacity-80 transition-opacity"
            />
          </a>
          <a href="https://www.ukrlp.co.uk/" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/Accreditation/UKRLP-Wartens-PLC-Training.webp"
              alt="UKRLP Registered - Wartens PLC Training"
              width={120}
              height={60}
              className="h-10 w-auto rounded hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        <div className="border-t border-white/[0.06] my-6" />

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="/privacy" className="text-xs text-text-muted hover:text-neon-blue transition-colors">
            Privacy Policy
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/terms" className="text-xs text-text-muted hover:text-neon-blue transition-colors">
            Terms of Service
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/cookies" className="text-xs text-text-muted hover:text-neon-blue transition-colors">
            Cookie Policy
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/complaints" className="text-xs text-text-muted hover:text-neon-blue transition-colors">
            Complaints Procedure
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/accessibility" className="text-xs text-text-muted hover:text-neon-blue transition-colors">
            Accessibility
          </Link>
        </div>

        <div className="border-t border-white/[0.06] my-6" />

        {/* Wartens Ecosystem */}
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">Wartens Ecosystem</p>
          <p className="text-xs text-text-muted">
            {ecosystemCompanies.map((c, i) => (
              <span key={c.name}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hover:text-neon-blue transition-colors"
                >
                  {c.name}
                </a>
                {i < ecosystemCompanies.length - 1 && <span className="mx-1.5 text-white/20">&middot;</span>}
              </span>
            ))}
          </p>
        </div>

        <div className="border-t border-white/[0.06] my-6" />

        {/* Copyright */}
        <p className="text-xs text-text-muted text-center">
          &copy; {new Date().getFullYear()} EDWartens UK. A Trading Name of{" "}
          <a href="https://wartens.com" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">
            Wartens Ltd
          </a>
          , a company registered in England and Wales.
          <br />
          CRN: 15262249 &middot; VAT: 473020522 &middot; D-U-N-S&reg;: 231167762 &middot; Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX
        </p>
      </div>
    </footer>
  );
}

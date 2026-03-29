import Link from "next/link";
import { Star, Quote } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Reviews & Testimonials - EDWartens PLC Training",
  description:
    "Read what EDWartens graduates say about their PLC and SCADA training experience. Real testimonials from automation engineers at Siemens, Rolls Royce, National Grid & more. 4.9/5 average rating.",
  keywords: [
    "EDWartens reviews",
    "PLC training reviews UK",
    "student testimonials",
    "SCADA training reviews",
    "automation course reviews",
    "EDWartens testimonials",
    "PLC course feedback",
    "industrial automation training reviews",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/reviews",
  },
  openGraph: {
    title: "Student Reviews & Testimonials | EDWartens UK",
    description:
      "Real testimonials from automation engineers. 4.9/5 average rating. Graduates working at Siemens, Rolls Royce, National Grid & more.",
    url: "https://edwartens.co.uk/reviews",
  },
};

const testimonials = [
  {
    name: "James Thornton",
    role: "PLC Programmer at Siemens",
    course: "Professional Module (5 Days)",
    rating: 5,
    text: "The Siemens module was exactly what I needed to transition from electrical maintenance into PLC programming. The hands-on labs with real S7-1200 hardware made a massive difference compared to online-only courses I had tried before. Within five weeks of finishing, Oscabe had me interviewing at Siemens and I got the offer. The instructors genuinely care about your progress.",
  },
  {
    name: "Priya Sharma",
    role: "SCADA Engineer at National Grid",
    course: "Professional Module (5 Days + Recorded)",
    rating: 5,
    text: "I came from an electronics background with zero PLC experience. The Professional Module took me from complete beginner to confidently programming both Siemens and Allen Bradley PLCs. The recorded content was brilliant for revision. The VR commissioning session was something I had never experienced anywhere else. Now I am working on SCADA systems at National Grid.",
  },
  {
    name: "Daniel Okafor",
    role: "Automation Engineer at Rolls Royce",
    course: "AI Module (5 Days)",
    rating: 5,
    text: "Coming from Nigeria with an electrical engineering degree, I needed UK-recognised certification to break into the automation industry here. EDWartens not only gave me that certification but also connected me with employers through Oscabe. The small class size meant I got plenty of time on the equipment. I started at Rolls Royce three months after completing the course.",
  },
  {
    name: "Sophie Williams",
    role: "Controls Engineer at BAE Systems",
    course: "Professional Module (5 Days + Recorded)",
    rating: 5,
    text: "Best investment I have made in my career. The teaching quality is outstanding and the Milton Keynes facility is well equipped. I particularly valued the Factory I/O simulation labs where you can test your PLC logic on virtual factory lines before going near real hardware. The CPD accreditation was important for my employer who sponsored my training.",
  },
  {
    name: "Arjun Patel",
    role: "Commissioning Engineer at Schneider Electric",
    course: "Professional Module (5 Days)",
    rating: 4,
    text: "Four days of intensive Siemens training that covered TIA Portal, PROFINET configuration, and WinCC HMI design. The pace was fast but the instructors adjusted to make sure everyone kept up. I would have liked an extra day on advanced topics, but the recorded supplementary material helped fill that gap. Highly recommend for anyone serious about a career in automation.",
  },
  {
    name: "Emily Chen",
    role: "IIoT Engineer at Amazon",
    course: "Professional Module (5 Days + Recorded)",
    rating: 5,
    text: "I was working in IT and wanted to move into industrial IoT. The Professional Module gave me the OT foundations I was missing. Understanding PLCs, SCADA, and industrial protocols at a practical level was transformative. The bridge between OT and IT is where the best career opportunities are, and EDWartens gave me the skills to cross it. Amazon hired me within two months.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < count
              ? "text-yellow-400 fill-yellow-400"
              : "text-white/10 fill-white/10"
          }
        />
      ))}
    </div>
  );
}

const reviewJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://edwartens.co.uk/#organization",
      name: "EDWartens UK",
      url: "https://edwartens.co.uk",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "150",
        bestRating: "5",
      },
      review: testimonials.map((t) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: t.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(t.rating),
          bestRating: "5",
        },
        reviewBody: t.text,
        itemReviewed: {
          "@type": "Course",
          name: t.course,
          provider: {
            "@type": "EducationalOrganization",
            name: "EDWartens UK",
          },
        },
      })),
    },
  ],
};

export default function ReviewsPage() {
  return (
    <div className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Reviews
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            What Our Graduates{" "}
            <span className="gradient-text">Say</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Real feedback from engineers who completed our CPD Accredited
            programmes and went on to build successful careers in industrial
            automation across the UK.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                4.9/5
              </p>
              <p className="text-xs text-text-muted">Average Rating</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                ✓
              </p>
              <p className="text-xs text-text-muted">Dedicated Career Support</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                2,500+
              </p>
              <p className="text-xs text-text-muted">Graduates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col"
              >
                {/* Quote icon */}
                <Quote
                  size={24}
                  className="text-neon-blue/20 mb-4 flex-shrink-0"
                />

                {/* Review text */}
                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                  {t.text}
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating count={t.rating} />
                </div>

                {/* Author */}
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-neon-blue">{t.role}</p>
                  <p className="text-xs text-text-muted mt-1">{t.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Join Our Next <span className="gradient-text">Cohort</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Become one of the thousands of engineers who have transformed their
            careers with EDWartens training. Book a free consultation today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Book a Consultation
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              View Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

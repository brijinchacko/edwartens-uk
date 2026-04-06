import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  GraduationCap,
  Building2,
  Briefcase,
  BookOpen,
  Globe,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "PLC Training FAQ | Frequently Asked Questions | EDWartens UK",
  description:
    "Answers to 30+ frequently asked questions about PLC training, SCADA courses, automation careers, EDWartens courses, and international student options. Everything you need to know before enrolling.",
  keywords: [
    "plc training faq",
    "what is plc training",
    "how long does plc training take",
    "plc programming course questions",
    "edwartens faq",
    "automation engineer questions",
    "scada training faq",
    "plc course fees uk",
    "is plc programming hard",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/faq",
  },
  openGraph: {
    title: "PLC Training FAQ | Frequently Asked Questions | EDWartens UK",
    description:
      "Answers to 30+ frequently asked questions about PLC training, SCADA courses, automation careers, and EDWartens courses.",
    url: "https://edwartens.co.uk/faq",
    siteName: "EDWartens UK",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

interface FAQCategory {
  id: string;
  title: string;
  icon: typeof GraduationCap;
  color: string;
  faqs: { q: string; a: string }[];
}

const categories: FAQCategory[] = [
  {
    id: "plc-training",
    title: "About PLC Training",
    icon: GraduationCap,
    color: "text-neon-blue",
    faqs: [
      {
        q: "What is PLC training?",
        a: "PLC training teaches you how to programme and configure Programmable Logic Controllers, which are the industrial computers that control automated machinery and processes in factories, water-treatment plants, power stations, and more. A good PLC course covers programming languages like Ladder Diagram and Structured Text, hardware configuration, fault diagnostics, and real-world project work using industry-standard software such as Siemens TIA Portal.",
      },
      {
        q: "How long does PLC training take?",
        a: "At EDWartens, the Professional Module runs as a 5-day intensive live course followed by online recorded sessions. This covers PLC programming, SCADA configuration, industrial networking, and hands-on simulation labs. Some providers offer shorter taster courses of 1 to 2 weeks, but these rarely provide enough depth for employers to consider you job-ready. Our intensive format strikes the balance between speed and thoroughness.",
      },
      {
        q: "Do I need an engineering degree for PLC training?",
        a: "No. While a degree in electrical, mechanical, or control engineering is helpful, it is not a requirement. Many of our successful graduates come from backgrounds in electrical installation, maintenance engineering, or even non-engineering disciplines. What matters most is an interest in technology, a willingness to learn, and basic numeracy skills. We start from the fundamentals and build up.",
      },
      {
        q: "What is the difference between PLC and SCADA?",
        a: "A PLC (Programmable Logic Controller) is the hardware and software that directly controls machines and processes at the field level. SCADA (Supervisory Control and Data Acquisition) is the software layer that sits above the PLC, providing operators with a visual interface to monitor and control the entire system from a central location. Most automation engineers need to be proficient in both, and EDWartens training covers them together.",
      },
      {
        q: "Is PLC programming hard to learn?",
        a: "PLC programming is logical and structured, which many students find more approachable than traditional software development. The most common language, Ladder Diagram, is visual and resembles electrical circuit diagrams. With guided instruction and hands-on practice, most beginners can write functional PLC programmes within the first two weeks of training. The challenge lies in building complexity and learning to troubleshoot real-world faults.",
      },
      {
        q: "What programming languages are used in PLCs?",
        a: "PLCs use five standard languages defined by the IEC 61131-3 international standard: Ladder Diagram (LD), Structured Text (ST), Function Block Diagram (FBD), Instruction List (IL), and Sequential Function Chart (SFC). Ladder Diagram is the most widely used in UK industry, while Structured Text is growing for complex applications. EDWartens courses cover all five, with primary focus on LD and ST.",
      },
      {
        q: "What is TIA Portal?",
        a: "TIA Portal (Totally Integrated Automation Portal) is Siemens' flagship engineering software for configuring and programming their S7-1200 and S7-1500 PLCs, as well as HMI panels, drives, and networking equipment. It is the most widely used PLC software in Europe and a core skill that employers look for. EDWartens uses TIA Portal extensively throughout its Professional Module.",
      },
    ],
  },
  {
    id: "about-edwartens",
    title: "About EDWartens",
    icon: Building2,
    color: "text-neon-green",
    faqs: [
      {
        q: "Where is EDWartens training centre located?",
        a: "EDWartens UK is based in Milton Keynes, Buckinghamshire. Milton Keynes is centrally located in England with excellent transport links, including direct trains to London Euston in under 40 minutes and easy access from the M1 motorway. Many of our students commute from London, Birmingham, Oxford, and Northampton. We also offer fully online training for those who cannot attend in person.",
      },
      {
        q: "Is EDWartens CPD accredited?",
        a: "Yes. EDWartens courses are CPD (Continuing Professional Development) accredited. This means the training meets independently verified quality standards recognised by employers and professional bodies across the UK. CPD accreditation confirms that our curriculum, delivery methods, and assessment processes have been reviewed and approved by an external certification body.",
      },
      {
        q: "Can I attend training online?",
        a: "Yes. EDWartens offers a fully online training option that covers the same curriculum as the in-person programme. Online students access live instructor-led sessions, virtual labs using FactoryIO 3D simulation software, and the same project-based assessments. The online format is particularly popular with international students and working professionals who cannot relocate to Milton Keynes.",
      },
      {
        q: "What is the course fee?",
        a: "Course fees vary depending on the module and format. Please visit our courses page or contact our admissions team for current pricing. We aim to keep our fees competitive while delivering high-quality, CPD-accredited training. Payment plans and instalment options are available to make the investment more manageable.",
      },
      {
        q: "Do you offer payment plans?",
        a: "Yes. We understand that training is an investment, and we offer flexible payment plans that allow you to spread the cost over several months. Details of available instalment options are provided during the enquiry process. Contact our admissions team to discuss a payment schedule that works for your circumstances.",
      },
      {
        q: "How many students per batch?",
        a: "We limit each batch to a maximum of 12 students. This ensures every student receives individual attention from the instructor, adequate time on lab equipment, and personalised feedback on projects. Small batch sizes are a key part of what makes EDWartens training effective and distinguishes us from larger, lecture-hall-style providers.",
      },
    ],
  },
  {
    id: "career",
    title: "Career Questions",
    icon: Briefcase,
    color: "text-purple",
    faqs: [
      {
        q: "What jobs can I get after PLC training?",
        a: "Graduates of PLC training typically pursue roles such as Junior PLC Programmer, Controls Engineer, Automation Technician, SCADA Engineer, Systems Integrator, or Commissioning Engineer. These roles exist across industries including water treatment, oil and gas, food manufacturing, pharmaceuticals, and automotive. Our recruitment partner network actively helps graduates connect with employers looking for trained PLC engineers.",
      },
      {
        q: "What is the average PLC engineer salary in the UK?",
        a: "The median salary for a PLC or automation engineer in the UK is approximately \u00a342,000 per year. Entry-level roles start around \u00a328,000 to \u00a335,000, while senior controls engineers and SCADA architects can earn \u00a365,000 to \u00a385,000 or more. Salaries are highest in London, the South East, and in specialist sectors like oil and gas. See our full salary guide for detailed breakdowns by role, region, and industry.",
      },
      {
        q: "Is there a shortage of automation engineers?",
        a: "Yes. The UK faces a significant and well-documented engineering skills gap. Industry bodies estimate the country needs to recruit large numbers of additional engineers each year to meet demand. Automation and controls engineering is one of the hardest areas to recruit for, because it requires a combination of electrical knowledge, programming skill, and industrial experience. This shortage means excellent job security and competitive salaries for qualified professionals.",
      },
      {
        q: "How long does it take to get a job after training?",
        a: "Most EDWartens graduates secure their first automation role within 2 to 4 months of completing training. This depends on factors like your location, willingness to relocate, prior experience, and the quality of your CV and interview preparation. We provide job-placement support including CV reviews, interview coaching, and introductions to our employer partner network.",
      },
      {
        q: "Do you help with job placement?",
        a: "Yes. EDWartens provides dedicated job-placement support to all graduates. This includes assistance with CV writing, LinkedIn profile optimisation, mock interview preparation, and direct introductions to hiring companies in our recruitment partner network. We also maintain an active jobs board and share relevant vacancies directly with recent graduates.",
      },
      {
        q: "Can I do PLC training while working?",
        a: "Yes. Our online training format is designed to accommodate working professionals. While the course is intensive and requires significant time commitment, many students manage it alongside part-time work or by arranging flexible hours with their employer. Some employers are willing to sponsor the training as professional development. Speak to our admissions team about scheduling options.",
      },
    ],
  },
  {
    id: "course-content",
    title: "Course Content",
    icon: BookOpen,
    color: "text-cyan",
    faqs: [
      {
        q: "What software do you use in training?",
        a: "Our primary software platform is Siemens TIA Portal, the industry-standard environment for programming Siemens S7-1200 and S7-1500 PLCs. We also use FactoryIO, a 3D industrial simulation tool that lets students test their PLC programmes on virtual factories before working with real hardware. Additional tools include WinCC for SCADA development and various networking configuration utilities.",
      },
      {
        q: "Do I get a certificate?",
        a: "Yes. Upon successful completion of the course, you receive a CPD-accredited certificate from EDWartens. This certificate is recognised by employers across the UK and internationally. It confirms that you have completed a structured training programme covering PLC programming, SCADA configuration, industrial networking, and practical project work to an independently verified standard.",
      },
      {
        q: "Is the certificate recognised by employers?",
        a: "Yes. Our CPD accreditation means the certificate meets nationally recognised quality standards. Employers in the automation industry are familiar with EDWartens and value our graduates. The certificate, combined with the practical project portfolio you build during training, demonstrates to employers that you have both theoretical knowledge and hands-on capability.",
      },
      {
        q: "Do you cover Siemens PLCs?",
        a: "Yes. Siemens is the primary PLC platform taught at EDWartens. We focus on the S7-1200 and S7-1500 product families using TIA Portal, as Siemens holds the dominant market share in the UK and Europe. Students learn hardware configuration, programme development in Ladder Diagram and Structured Text, HMI panel design, and Profinet industrial networking using Siemens equipment.",
      },
      {
        q: "What is FactoryIO?",
        a: "FactoryIO is a 3D industrial-plant simulation tool that connects to real PLC programmes via OPC UA or other communication protocols. It provides a virtual factory environment with conveyor belts, robotic arms, sorting stations, and process tanks. Students use FactoryIO to test and debug their PLC logic in a realistic visual setting before deploying to physical hardware, significantly accelerating the learning process.",
      },
      {
        q: "Is there practical / hands-on training?",
        a: "Absolutely. Practical, hands-on experience is the cornerstone of EDWartens training. In-person students work with real Siemens PLCs, HMI panels, and industrial I/O modules in our Milton Keynes lab. Online students use FactoryIO 3D simulation and remote-access lab sessions. Every student completes multiple project-based assignments that simulate real industrial scenarios, building a portfolio to show employers.",
      },
    ],
  },
  {
    id: "international",
    title: "For International Students",
    icon: Globe,
    color: "text-yellow-400",
    faqs: [
      {
        q: "Can EU residents attend training?",
        a: "Yes. EU nationals are welcome to attend both in-person and online training. Since Brexit, EU citizens visiting the UK for short courses of up to 6 months do not typically need a visa under the Standard Visitor route, but you should check the latest UK government guidance for your specific nationality. Our online option also eliminates the need for travel entirely.",
      },
      {
        q: "Is online training available for international students?",
        a: "Yes. Our online training programme is fully accessible to international students anywhere in the world. You receive the same curriculum, live instructor-led sessions, FactoryIO simulation access, and CPD-accredited certificate as in-person students. We currently have students and graduates from across Europe, the Middle East, Africa, and Asia participating in our online programmes.",
      },
      {
        q: "What visa do I need for in-person training?",
        a: "For short training courses of up to 6 months, most nationalities can enter the UK on a Standard Visitor visa or under the Electronic Travel Authorisation (ETA) scheme. EDWartens is not a licensed Tier 4 student visa sponsor, so we cannot support long-term student visas. We recommend checking the UK government website (gov.uk) for the latest visa requirements based on your nationality.",
      },
      {
        q: "Do you have students from other countries?",
        a: "Yes. EDWartens is part of a global training organisation with operations in India, the UAE, and the United States, alongside the UK. Our UK courses attract students from across Europe, the Middle East, and beyond. This international cohort enriches the learning experience and reflects the global nature of the automation industry. Over 30,000 engineers have been trained across all EDWartens locations worldwide.",
      },
      {
        q: "Is training in English?",
        a: "Yes. All EDWartens UK courses are delivered entirely in English. Course materials, software interfaces, assessments, and instructor-led sessions are all in English. A working proficiency in English is required to follow the technical content and participate in group exercises. If English is not your first language, we recommend a B2 level or higher on the CEFR scale.",
      },
    ],
  },
  {
    id: "high-value",
    title: "Popular Questions",
    icon: GraduationCap,
    color: "text-neon-blue",
    faqs: [
      {
        q: "What is the best PLC training course in the UK?",
        a: "EDWartens UK offers CPD Accredited PLC and SCADA training rated as Best PLC Training Provider UK 2025 by Radio Lemon Live. Our Professional Module is a 5-day intensive programme covering Siemens PLC programming with TIA Portal, HMI development, and WinCC SCADA. We are also a UK Startup Awards 2025 National Winner. All training is delivered by practising automation engineers, not academic lecturers, ensuring industry-relevant skills from day one.",
      },
      {
        q: "How much does PLC training cost in the UK?",
        a: "EDWartens UK's Professional Module costs £2,140 + VAT for a comprehensive 5-day course covering Siemens PLC, HMI, and WinCC SCADA with 15 hours of recorded sessions, CPD Accredited certification, and dedicated career support including interview preparation and CV review. Flexible payment plans are available. This is among the best value CPD Accredited PLC courses in the UK given the breadth of content and career services included.",
      },
      {
        q: "Can I do PLC training online from Europe?",
        a: "Yes. EDWartens offers 100% live online PLC and SCADA training accessible from 18 European countries including Germany, Netherlands, Poland, Ireland, France, Spain, Italy, and more. Online students receive the same CPD Accredited curriculum, live instructor-led sessions, FactoryIO simulation access, and certification as in-person students. We currently serve students across the UK and Europe.",
      },
      {
        q: "What PLC brands does EDWartens teach?",
        a: "EDWartens UK primarily teaches Siemens S7 PLC programming using TIA Portal, as Siemens holds the dominant market share in the UK and Europe. The curriculum also covers Allen-Bradley (Rockwell Automation) with Studio 5000, WinCC SCADA, HMI panel design, and industrial networking with Profinet. Our AI Module additionally covers Python for engineers, predictive maintenance, and computer vision for industrial applications.",
      },
      {
        q: "Is CPD accreditation recognised in Europe?",
        a: "Yes. CPD (Continuing Professional Development) accreditation is internationally recognised across Europe and beyond. EDWartens UK's CPD Accredited courses meet independently verified quality standards that employers and professional bodies recognise globally. Many of our European students have used their EDWartens CPD certificates to demonstrate professional development to employers in Germany, the Netherlands, Ireland, and other EU countries.",
      },
    ],
  },
];

// Flatten all FAQs for schema
const allFaqs = categories.flatMap((cat) => cat.faqs);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FAQPage() {
  return (
    <div className="pt-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 pt-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-secondary">FAQ</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
            Frequently Asked Questions
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl">
            Everything You Need to Know About{" "}
            <span className="gradient-text">PLC Training</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Answers to 30+ common questions about PLC and SCADA training, automation engineering careers,
            EDWartens courses, and options for international students. If your question is not covered here,
            please get in touch.
          </p>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="py-8 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg glass-card text-xs font-medium text-text-secondary hover:text-white transition-colors"
              >
                <cat.icon size={14} className={cat.color} />
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      {categories.map((cat, catIndex) => (
        <section
          key={cat.id}
          id={cat.id}
          className={`py-16 ${catIndex % 2 === 1 ? "mesh-gradient-alt" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center`}>
                  <cat.icon size={20} className={cat.color} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{cat.title}</h2>
              </div>
            </ScrollReveal>

            <div className="space-y-3 max-w-3xl">
              {cat.faqs.map((faq, i) => (
                <ScrollReveal key={i} delay={i * 50}>
                  <details className="glass-card rounded-xl group">
                    <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer">
                      <span className="text-sm font-semibold text-white">{faq.q}</span>
                      <ChevronRight
                        size={18}
                        className="text-text-muted flex-shrink-0 transition-transform duration-200 group-open:rotate-90"
                      />
                    </summary>
                    <div className="px-5 pb-5 -mt-1">
                      <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 mesh-gradient-purple">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
              <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
                Still Have Questions?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Get in <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Our admissions team is happy to answer any questions not covered here. Reach out by
                phone, email, or through our contact form.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
                >
                  Contact Us
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white font-semibold text-sm hover:bg-white/[0.04] transition-all"
                >
                  <GraduationCap size={16} />
                  View Courses
                </Link>
                <Link
                  href="/automation-engineer-career-guide"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white font-semibold text-sm hover:bg-white/[0.04] transition-all"
                >
                  <Briefcase size={16} />
                  Career Guide
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://edwartens.co.uk",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "FAQ",
                item: "https://edwartens.co.uk/faq",
              },
            ],
          }),
        }}
      />
    </div>
  );
}

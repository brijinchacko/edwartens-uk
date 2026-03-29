import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  BarChart3,
  Monitor,
  CheckCircle2,
  Cpu,
  BookOpen,
  Wrench,
  Users,
  Award,
  ArrowRight,
  Download,
  Layers,
  Settings,
  Zap,
  Shield,
  TrendingUp,
  FileText,
  Briefcase,
  GraduationCap,
  PoundSterling,
  Video,
  BadgeCheck,
  Brain,
  Eye,
  LineChart,
  Cog,
} from "lucide-react";
import FAQAccordion from "@/components/FAQAccordion";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "AI Module - AI-Powered Industrial Automation Training | EDWartens UK",
  description:
    "EDWartens UK AI Module: 5-day classroom training + 12 hours recorded sessions. Covers AI, Machine Learning, Predictive Maintenance, Computer Vision, AI-SCADA. CPD Accredited with career support. £2,140 + VAT.",
  keywords: [
    "AI automation course UK",
    "machine learning industrial automation",
    "predictive maintenance training",
    "computer vision quality control course",
    "AI SCADA training",
    "digital twin course UK",
    "CPD accredited AI training",
    "industrial AI course",
    "AI engineer training UK",
    "EDWartens AI module",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/courses/ai-module",
  },
  openGraph: {
    title: "AI Module - AI-Powered Industrial Automation Training | EDWartens UK",
    description:
      "5-day + 12hr recorded sessions programme. Covers AI, ML, Computer Vision, Predictive Maintenance, AI-SCADA. CPD Accredited with career support. £2,140 + VAT.",
    url: "https://edwartens.co.uk/courses/ai-module",
  },
};

const faqData = [
  {
    q: "What career support is included with this course?",
    a: "Our AI Module includes dedicated interview preparation, resume writing, and career support. We work with a network of employers across the UK. While we cannot guarantee employment, our structured career support and industry connections give you the strongest possible foundation for pursuing your first AI automation role. Career outcomes depend on individual qualifications, experience, and market conditions.",
  },
  {
    q: "What does the £2,140 + VAT cover?",
    a: "The fee covers 5 full days of classroom training, 12 hours of pre-recorded sessions for self-paced learning, all course materials and software licences for the duration, CPD Accredited certification, interview preparation sessions, resume review, and lifetime access to our alumni community.",
  },
  {
    q: "Do I need prior programming or AI experience?",
    a: "No. The course starts with Phase 0 (pre-recorded sessions) covering Basic Electrical and Electronics from scratch, and Day 1 covers Python fundamentals for automation engineers. Even career switchers with no programming background can follow the programme. However, a genuine interest in technology and willingness to study is essential.",
  },
  {
    q: "What is the format - is it all classroom-based?",
    a: "The programme combines two formats: 12 hours of pre-recorded sessions (Phase 0) that you study at your own pace before the classroom dates, followed by 5 full days of intensive classroom training at our Milton Keynes facility. The recorded sessions build your foundation so you can make the most of the hands-on classroom time.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes, we offer flexible payment plans. Please contact our team to discuss instalment options that work for your budget. We want the course to be accessible to anyone serious about building a career in AI-powered automation.",
  },
  {
    q: "How is the CPD accreditation verified?",
    a: "Your CPD Accredited certificate is issued through EDWartens UK and can be verified by employers through our online verification portal. CPD accreditation demonstrates that the course meets recognised standards of continuing professional development in the UK.",
  },
  {
    q: "What kind of roles can I apply for after completing this course?",
    a: "Graduates typically pursue roles such as AI Automation Engineer, Data-Driven Controls Engineer, Predictive Maintenance Specialist, Machine Vision Engineer, Process Optimisation Analyst, and Industrial AI Developer. These are rapidly growing roles with competitive salaries in the UK.",
  },
  {
    q: "How does this differ from the Professional Module?",
    a: "The Professional Module focuses on traditional PLC, HMI, and SCADA programming. The AI Module shares the same foundation (Phase 0) but then dives into AI and Machine Learning applications: predictive maintenance, computer vision for quality control, and AI-powered SCADA optimisation. If you want to specialise in the future of automation, the AI Module is ideal.",
  },
];

const phases = [
  {
    phase: "Phase 0",
    title: "Foundation (Pre-recorded)",
    duration: "12+ hours self-paced",
    icon: Video,
    color: "neon-blue",
    topics: [
      "Basic Electrical - voltage, current, resistance, circuit theory",
      "AC and DC fundamentals, power calculations",
      "Basic Electronics - semiconductors, transistors, relays",
      "Introduction to Pneumatics and Industrial Automation",
      "Introduction to PLC concepts and architecture",
    ],
  },
  {
    phase: "Phase 1",
    title: "AI Fundamentals for Industrial Automation",
    duration: "Day 1",
    icon: Brain,
    color: "neon-green",
    topics: [
      "Introduction to AI and Machine Learning in Industry 4.0",
      "Python fundamentals for automation engineers",
      "Data collection and preprocessing from industrial systems",
      "Understanding industrial datasets - sensor data, logs, time series",
      "Hands-on: Setting up Python environment with industrial data",
    ],
  },
  {
    phase: "Phase 2",
    title: "Machine Learning for Predictive Maintenance",
    duration: "Day 2",
    icon: LineChart,
    color: "neon-blue",
    topics: [
      "Supervised and unsupervised learning concepts",
      "Building predictive maintenance models",
      "Anomaly detection in industrial processes",
      "Feature engineering from sensor data",
      "Hands-on: Training ML models with real sensor data",
    ],
  },
  {
    phase: "Phase 3",
    title: "Computer Vision for Quality Control",
    duration: "Day 3",
    icon: Eye,
    color: "neon-green",
    topics: [
      "Image processing fundamentals for industrial applications",
      "Object detection and classification techniques",
      "Quality inspection using AI vision systems",
      "Defect detection and classification pipelines",
      "Hands-on: Building a vision-based quality control system",
    ],
  },
  {
    phase: "Phase 4",
    title: "AI-Powered SCADA & Process Optimisation",
    duration: "Day 4",
    icon: Cog,
    color: "neon-blue",
    topics: [
      "AI integration with SCADA systems",
      "Process optimisation using AI algorithms",
      "Digital twin concepts and implementation",
      "Real-time monitoring with AI-enhanced dashboards",
      "Hands-on: Building an AI-enhanced monitoring dashboard",
    ],
  },
  {
    phase: "Phase 5",
    title: "Career Preparation & Assessment",
    duration: "Day 5",
    icon: Briefcase,
    color: "neon-green",
    topics: [
      "Comprehensive project combining PLC fundamentals and AI",
      "Technical interview preparation and common questions",
      "Resume and CV writing for AI automation roles",
      "LinkedIn profile optimisation for the AI automation industry",
      "Final assessment and CPD certificate award",
    ],
  },
];

const completionItems = [
  {
    icon: BadgeCheck,
    title: "CPD Accredited Certificate",
    desc: "Industry-recognised certification verifiable by employers via our online portal.",
  },
  {
    icon: Video,
    title: "12 Hours Recorded Content",
    desc: "Lifetime access to pre-recorded foundation sessions for revision and reference.",
  },
  {
    icon: FileText,
    title: "Interview Prep Pack",
    desc: "Technical question bank, CV template, and LinkedIn optimisation guide.",
  },
  {
    icon: Download,
    title: "Course Materials",
    desc: "All slides, Python notebooks, ML models, and project files.",
  },
  {
    icon: Users,
    title: "Alumni Network Access",
    desc: "Join 30,000+ engineers for job leads, mentorship, and industry updates.",
  },
  {
    icon: Briefcase,
    title: "6-Month Career Support",
    desc: "Active job matching, interview scheduling, and career coaching post-completion.",
  },
];

const salaryData = [
  { role: "IoT / AI Automation Engineer", range: "£40,000 - £86,000" },
  { role: "Predictive Maintenance Specialist", range: "£38,000 - £65,000" },
  { role: "Machine Vision Engineer", range: "£42,000 - £75,000" },
  { role: "Process Optimisation Analyst", range: "£35,000 - £55,000" },
  { role: "Industrial AI Developer", range: "£45,000 - £80,000" },
  { role: "Senior AI Automation Engineer", range: "£60,000 - £95,000+" },
];

export const dynamic = "force-dynamic";

export default async function AIModulePage() {
  const aiBatches = await prisma.batch.findMany({
    where: { course: "AI_MODULE", status: "UPCOMING", startDate: { gte: new Date() } },
    include: { _count: { select: { students: true } } },
    orderBy: { startDate: "asc" },
  });

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AI & Industrial Automation Module",
    description: "Advanced training in AI-powered industrial automation, machine learning for manufacturing, and smart factory systems. CPD Accredited.",
    provider: { "@type": "EducationalOrganization", name: "EDWartens UK", url: "https://edwartens.co.uk" },
    educationalCredentialAwarded: "CPD Certification",
    courseMode: ["Classroom", "Online"],
    url: "https://edwartens.co.uk/courses/ai-module",
    hasCourseInstance: aiBatches.slice(0, 5).map(b => ({
      "@type": "CourseInstance",
      courseMode: "Blended",
      startDate: b.startDate.toISOString().split("T")[0],
      location: { "@type": "Place", name: "Milton Keynes, UK" },
    })),
  };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the AI & Industrial Automation Module?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "This advanced module covers AI-powered industrial automation, machine learning for manufacturing, computer vision for quality control, and smart factory systems using Industry 4.0 technologies.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to complete the Professional Module first?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "While the Professional Module provides a strong foundation, the AI Module can be taken independently if you have existing PLC and automation experience.",
                },
              },
              {
                "@type": "Question",
                name: "Is this course CPD accredited?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, the AI & Industrial Automation Module is CPD Accredited, and you receive a CPD certificate upon successful completion.",
                },
              },
              {
                "@type": "Question",
                name: "What software and tools will I learn?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You will work with TensorFlow, Python for industrial applications, Siemens TIA Portal AI functions, computer vision libraries, and IoT platforms for smart manufacturing.",
                },
              },
              {
                "@type": "Question",
                name: "What career opportunities does this open up?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Graduates pursue roles such as AI Automation Engineer, Smart Factory Specialist, Industrial IoT Developer, and Industry 4.0 Consultant, with salaries ranging from £45,000 to £85,000.",
                },
              },
            ],
          }),
        }}
      />
      {/* ===== HERO ===== */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-neon-blue transition-colors mb-6"
          >
            <ArrowRight size={14} className="rotate-180" />
            All Courses
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue">
              New Programme
            </p>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue to-purple text-[11px] font-semibold text-white">
              AI-Powered
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            AI <span className="gradient-text">Module</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-8">
            Our cutting-edge programme combining PLC fundamentals with AI and
            Machine Learning for industrial automation. Five days of intensive
            classroom training plus 12 hours of recorded sessions, with CPD
            accreditation and dedicated career support.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Clock size={14} className="text-neon-blue" /> 5 Days + 12hrs Recorded
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <BarChart3 size={14} className="text-neon-green" /> Comprehensive
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Monitor size={14} className="text-neon-blue" /> Classroom + Online
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm font-semibold text-neon-green">
              <PoundSterling size={14} /> £2,140 + VAT
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Shield size={14} className="text-neon-green" /> Career-Focused
            </span>
          </div>
        </div>
      </section>

      {/* ===== COURSE OVERVIEW ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Course <span className="gradient-text">Overview</span>
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  The AI Module is EDWartens UK&apos;s forward-looking programme
                  designed to prepare automation engineers for Industry 4.0. It
                  combines a solid foundation in electrical and PLC fundamentals
                  with cutting-edge AI and Machine Learning techniques specifically
                  applied to industrial automation.
                </p>
                <p>
                  The course begins with 12 hours of pre-recorded sessions covering
                  Basic Electrical, Electronics, and PLC concepts. The five
                  intensive classroom days then progressively cover AI fundamentals,
                  predictive maintenance, computer vision for quality control,
                  AI-powered SCADA optimisation, and digital twin concepts.
                </p>
                <p>
                  What truly sets this programme apart is the combination of
                  traditional automation knowledge with modern AI capabilities. Day
                  5 is dedicated to career preparation including interview prep,
                  resume writing, and LinkedIn optimisation. Post-completion, our
                  career support team provides six months of active job matching
                  and career coaching.
                </p>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="glass-card gradient-border rounded-2xl p-6 h-fit">
              <div className="text-center mb-6">
                <p className="text-sm text-text-muted mb-1">Course Fee</p>
                <p className="text-4xl font-bold gradient-text">£2,140</p>
                <p className="text-sm text-text-muted">+ VAT</p>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Duration</span>
                  <span className="text-white font-medium">5 Days + 12hrs</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Level</span>
                  <span className="text-white font-medium">Comprehensive</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Mode</span>
                  <span className="text-white font-medium">Classroom + Online</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Certificate</span>
                  <span className="text-neon-green font-medium">CPD Accredited</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Career Support</span>
                  <span className="text-neon-green font-medium">Career-Focused</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment Plans</span>
                  <span className="text-white font-medium">Available</span>
                </div>
              </div>
              <Link
                href="#upcoming-batches"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Enrol Now <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-text-muted text-center mt-3">
                Flexible payment plans available
              </p>
              <p className="text-xs text-text-muted text-center mt-2">
                Instalments via Klarna & ClearPay available at checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEY TOPICS ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">Complete Curriculum</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Everything You&apos;ll <span className="gradient-text">Master</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "Basic Electrical", color: "neon-blue" },
              { icon: Cpu, label: "Basic Electronics", color: "neon-green" },
              { icon: Brain, label: "AI & Machine Learning", color: "neon-blue" },
              { icon: BookOpen, label: "Python for Engineers", color: "neon-green" },
              { icon: LineChart, label: "Predictive Maintenance", color: "neon-blue" },
              { icon: Eye, label: "Computer Vision", color: "neon-green" },
              { icon: Monitor, label: "AI-Powered SCADA", color: "neon-blue" },
              { icon: Layers, label: "Digital Twins", color: "neon-green" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="glass-card rounded-xl p-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={`text-${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PHASE BREAKDOWN ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Phase-by-Phase Syllabus</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Your Learning <span className="gradient-text">Journey</span>
            </h2>
          </div>

          <div className="space-y-6">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div key={phase.phase} className="glass-card rounded-2xl p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-${phase.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} className={`text-${phase.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-[11px] uppercase tracking-widest text-${phase.color} font-semibold`}>
                          {phase.phase}
                        </span>
                        <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-white/[0.04]">
                          {phase.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                    </div>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {phase.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <CheckCircle2 size={16} className="text-neon-green/60 mt-0.5 flex-shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHO SHOULD ENROL ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
            Who Should <span className="gradient-text">Enrol</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Fresh Graduates",
                desc: "Engineering or IT graduates who want to combine automation skills with cutting-edge AI capabilities for the Industry 4.0 era.",
              },
              {
                icon: Zap,
                title: "Career Switchers",
                desc: "Professionals from data science, software, or other technical fields who want to enter the high-demand AI automation sector.",
              },
              {
                icon: Wrench,
                title: "Automation Engineers",
                desc: "Existing PLC engineers and technicians who want to add AI and ML capabilities to their skill set for career advancement.",
              },
              {
                icon: Users,
                title: "Data Professionals",
                desc: "Data analysts and scientists who want to apply their skills specifically to industrial automation and manufacturing.",
              },
              {
                icon: TrendingUp,
                title: "Innovation Leaders",
                desc: "Managers and team leads who need to understand AI automation to drive digital transformation in their organisations.",
              },
              {
                icon: Briefcase,
                title: "Job Seekers",
                desc: "Anyone seeking employment in the rapidly growing AI automation sector who needs both technical skills and career support.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-neon-blue" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== COMPLETION ITEMS ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
            What You Get on <span className="gradient-text">Completion</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-neon-green" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== REQUIREMENTS ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Requirements</h2>
          <div className="glass-card rounded-2xl p-8">
            <ul className="space-y-4">
              {[
                "A laptop with Windows 10 or later (required for software tools and Python environment)",
                "Reliable internet connection (for pre-recorded sessions and software downloads)",
                "No prior AI, programming, or engineering experience required - the programme starts from scratch",
                "Commitment to complete the 12 hours of pre-recorded sessions before the classroom dates",
                "Valid photo ID for in-person attendance at the Milton Keynes training centre",
                "A genuine interest in pursuing a career in AI-powered industrial automation",
              ].map((req) => (
                <li key={req} className="flex items-start gap-3 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-2.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SALARY DATA ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">UK Salary Data</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Career <span className="gradient-text">Earning Potential</span>
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
              AI automation engineering is one of the fastest-growing and highest-paying
              technical disciplines in the UK. Here are typical salary ranges for roles our
              graduates pursue.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryData.map((item) => (
              <div key={item.role} className="glass-card rounded-xl p-6 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">{item.role}</h3>
                <span className="text-sm font-medium text-neon-green whitespace-nowrap">{item.range}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted text-center mt-6">
            Sources: Indeed UK, Glassdoor UK, PayScale, Talent.com (2025–2026). Actual salaries vary by location, experience, and employer.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={faqData} />
          </div>
        </div>
      </section>

      {/* ===== UPCOMING BATCHES ===== */}
      <section id="upcoming-batches" className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Upcoming Batches</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Choose Your <span className="gradient-text">Start Date</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {aiBatches.map((batch) => {
              const seats = batch.capacity - batch._count.students;
              return (
                <Link key={batch.id} href={`/courses/ai-module/batch/${batch.id}`} className="glass-card rounded-xl p-5 hover:border-neon-blue/20 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">{batch.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${seats <= 3 ? 'bg-yellow-400/10 text-yellow-400' : 'bg-neon-green/10 text-neon-green'}`}>
                      {seats} seats left
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span>Starts: {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(batch.startDate)}</span>
                    <span>{batch.location || 'Milton Keynes'}</span>
                  </div>
                  <span className="text-xs text-neon-blue group-hover:underline">View Details & Register →</span>
                </Link>
              );
            })}
          </div>
          {aiBatches.length === 0 && (
            <p className="text-center text-text-muted">No upcoming batches scheduled. <Link href="/contact" className="text-neon-blue hover:underline">Contact us</Link> to express interest.</p>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 mesh-gradient-hero relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Launch Your AI Automation <span className="gradient-text">Career Today</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-4">
            Join our AI Module and get the skills, certification, and career support
            you need to land your first AI automation role.
          </p>
          <p className="text-2xl font-bold gradient-text mb-8">
            £2,140 + VAT - Payment Plans Available
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              Book Free Consultation <ArrowRight size={16} />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg glass-card text-white font-semibold hover:bg-white/[0.06] transition-all"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SCHEMA SECTION ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              Common Questions
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              AI Module{" "}
              <span className="gradient-text">FAQs</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="glass-card rounded-xl group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-white font-semibold text-sm hover:text-neon-blue transition-colors">
                What is the AI &amp; Industrial Automation Module?
                <span className="text-neon-blue transition-transform group-open:rotate-45 text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                <p className="pt-4">
                  This advanced module covers AI-powered industrial automation, machine learning for manufacturing, computer vision for quality control, and smart factory systems using Industry 4.0 technologies.
                </p>
              </div>
            </details>

            <details className="glass-card rounded-xl group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-white font-semibold text-sm hover:text-neon-blue transition-colors">
                Do I need to complete the Professional Module first?
                <span className="text-neon-blue transition-transform group-open:rotate-45 text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                <p className="pt-4">
                  While the Professional Module provides a strong foundation, the AI Module can be taken independently if you have existing PLC and automation experience.
                </p>
              </div>
            </details>

            <details className="glass-card rounded-xl group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-white font-semibold text-sm hover:text-neon-blue transition-colors">
                Is this course CPD accredited?
                <span className="text-neon-blue transition-transform group-open:rotate-45 text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                <p className="pt-4">
                  Yes, the AI &amp; Industrial Automation Module is CPD Accredited, and you receive a CPD certificate upon successful completion.
                </p>
              </div>
            </details>

            <details className="glass-card rounded-xl group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-white font-semibold text-sm hover:text-neon-blue transition-colors">
                What software and tools will I learn?
                <span className="text-neon-blue transition-transform group-open:rotate-45 text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                <p className="pt-4">
                  You will work with TensorFlow, Python for industrial applications, Siemens TIA Portal AI functions, computer vision libraries, and IoT platforms for smart manufacturing.
                </p>
              </div>
            </details>

            <details className="glass-card rounded-xl group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none text-white font-semibold text-sm hover:text-neon-blue transition-colors">
                What career opportunities does this open up?
                <span className="text-neon-blue transition-transform group-open:rotate-45 text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                <p className="pt-4">
                  Graduates pursue roles such as AI Automation Engineer, Smart Factory Specialist, Industrial IoT Developer, and Industry 4.0 Consultant, with salaries ranging from £45,000 to £85,000.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Monitor,
  MapPin,
  Calendar,
  Cpu,
  Headset,
  BookOpen,
  ChevronDown,
  Clock,
  Wrench,
  Users,
  GraduationCap,
  Zap,
  Shield,
  Brain,
  Factory,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Cog,
  Bot,
} from "lucide-react";

const deliveryModes = [
  {
    icon: MapPin,
    title: "Classroom Training",
    location: "Milton Keynes, MK1 1EX",
    description:
      "Hands-on training at our facility at 8 Lyon Road, Milton Keynes. Work with Siemens PLC hardware, industrial panels, and FactoryIO simulation under the guidance of experienced engineers.",
    color: "neon-blue",
  },
  {
    icon: Monitor,
    title: "Online Live Sessions",
    location: "Anywhere in the UK",
    description:
      "Join interactive live sessions with screen sharing, remote lab access via FactoryIO, and real-time Q&A. Ideal for professionals who cannot travel to Milton Keynes for in-person training.",
    color: "neon-green",
  },
  {
    icon: Headset,
    title: "Pre-recorded Foundation",
    location: "12+ Hours Self-Paced",
    description:
      "Both courses include 12+ hours of pre-recorded foundation sessions covering Basic Electrical, Electronics, Pneumatics, Industrial Automation, and PLC fundamentals — study at your own pace before class.",
    color: "purple",
  },
];

/* ---- Professional Module Week ---- */
const profWeek = [
  {
    day: "Pre-Course",
    label: "Phase 0",
    focus: "Foundation (Pre-recorded Sessions)",
    detail:
      "12+ hours of self-paced sessions covering Basic Electrical, Basic Electronics, Introduction to Pneumatics, Industrial Automation, and Introduction to PLC. Complete before your classroom dates.",
  },
  {
    day: "Day 1",
    label: "Phase 1",
    focus: "PLC Programming with Siemens TIA Portal",
    detail:
      "Introduction to Siemens TIA Portal, PLC overview, understanding hardware and architecture, basics of ladder logic programming, hands-on practice creating PLC programs, troubleshooting techniques.",
  },
  {
    day: "Day 2",
    label: "Phase 2",
    focus: "Advanced PLC Programming & Applications",
    detail:
      "Advanced programming concepts in Siemens TIA Portal, developing complex PLC programs, simulation and testing of PLC programs, practical applications and case studies.",
  },
  {
    day: "Day 3",
    label: "Phase 3",
    focus: "HMI Development with Siemens TIA Portal",
    detail:
      "Introduction to HMI and its importance, Siemens HMI hardware and software, creating HMI projects, designing screens and navigation, integrating HMI with PLC programs, best practices.",
  },
  {
    day: "Day 4",
    label: "Phase 4",
    focus: "Introduction to SCADA (WinCC)",
    detail:
      "Overview of WinCC SCADA System, SCADA in Industrial Automation, exploring WinCC interface, tags and tag-based data acquisition, creating graphics and objects, building a SCADA application.",
  },
  {
    day: "Day 5",
    label: "Phase 5",
    focus: "Advanced Features & Career Preparation",
    detail:
      "Dynamic graphics and animation, alarm and event management, trending and historical data analysis, introduction to FactoryIO, project creation, interview preparation, resume writing.",
  },
];

/* ---- AI Module Week ---- */
const aiWeek = [
  {
    day: "Pre-Course",
    label: "Phase 0",
    focus: "Foundation (Pre-recorded Sessions)",
    detail:
      "12+ hours of self-paced sessions covering Basic Electrical, Basic Electronics, Introduction to Pneumatics, Industrial Automation, and Introduction to PLC. Complete before your classroom dates.",
  },
  {
    day: "Day 1",
    label: "Phase 1",
    focus: "AI Fundamentals for Industrial Automation",
    detail:
      "Introduction to AI and Machine Learning in Industry, Python fundamentals for automation engineers, data collection and preprocessing from industrial systems, setting up Python with industrial data.",
  },
  {
    day: "Day 2",
    label: "Phase 2",
    focus: "Machine Learning for Predictive Maintenance",
    detail:
      "Supervised and unsupervised learning concepts, building predictive maintenance models, anomaly detection in industrial processes, hands-on training ML models with sensor data.",
  },
  {
    day: "Day 3",
    label: "Phase 3",
    focus: "Computer Vision for Quality Control",
    detail:
      "Image processing fundamentals, object detection and classification, quality inspection using AI vision systems, building a vision-based quality control system.",
  },
  {
    day: "Day 4",
    label: "Phase 4",
    focus: "AI-Powered SCADA & Process Optimisation",
    detail:
      "AI integration with SCADA systems, process optimisation using AI algorithms, digital twin concepts, building an AI-enhanced monitoring dashboard.",
  },
  {
    day: "Day 5",
    label: "Phase 5",
    focus: "Career Preparation & Assessment",
    detail:
      "Comprehensive project combining PLC and AI, technical interview preparation, resume and CV writing for AI automation roles, final assessment and CPD certificate award.",
  },
];

const tools = [
  {
    name: "Siemens TIA Portal",
    vendor: "Siemens",
    description:
      "Industry-standard engineering framework for programming Siemens S7-1200 PLCs, designing WinCC HMIs, and configuring SCADA systems. Used by engineers worldwide.",
  },
  {
    name: "WinCC SCADA",
    vendor: "Siemens",
    description:
      "Supervisory Control and Data Acquisition system for monitoring and controlling industrial processes. Build dashboards, trends, alarms, and reporting.",
  },
  {
    name: "Factory I/O",
    vendor: "Real Games",
    description:
      "3D factory simulation software that connects to real PLCs. Practice automation logic on virtual conveyor systems, sorting stations, and pick-and-place machines.",
  },
  {
    name: "Python & ML Libraries",
    vendor: "AI Module",
    description:
      "Python with TensorFlow, scikit-learn, and OpenCV for AI Module students. Build predictive maintenance models, computer vision systems, and AI-enhanced dashboards.",
  },
];

const whyAutomation = [
  {
    icon: Shield,
    title: "AI Cannot Replace PLC Engineers",
    text: "Programmable Logic Controllers are physical hardware systems controlling real-world machinery — conveyors, robots, valves, motors. AI cannot physically wire a control panel, commission a PLC on a factory floor, or troubleshoot a live production line. These are hands-on, safety-critical skills that require human engineers on site.",
  },
  {
    icon: Factory,
    title: "Every Factory Runs on PLCs",
    text: "From food processing to automotive, pharmaceutical to energy — every manufacturing facility in the UK relies on PLCs and SCADA systems. There are over 180,000 manufacturing firms in the UK, and virtually all of them need engineers who can program, maintain, and troubleshoot these systems.",
  },
  {
    icon: TrendingUp,
    title: "Demand Is Growing, Not Shrinking",
    text: "The UK faces a critical shortage of automation engineers. Industry reports estimate 2.1 million engineering roles need filling by 2030. As factories become smarter with Industry 4.0, the need for PLC and SCADA engineers is accelerating, not declining. AI adds new roles on top of existing ones.",
  },
  {
    icon: Bot,
    title: "AI Enhances Automation — It Doesn't Replace It",
    text: "AI and Machine Learning are powerful tools that sit on top of traditional automation. Predictive maintenance uses AI to analyse PLC data. Computer vision enhances quality control. But underneath every AI system in a factory, there is still a PLC running the physical process. The engineer who understands both has a massive advantage.",
  },
  {
    icon: Cog,
    title: "Physical Infrastructure Cannot Be Automated Away",
    text: "Unlike software jobs that can be outsourced or automated, PLC engineering requires physical presence on site — commissioning equipment, testing I/O wiring, calibrating sensors, and ensuring safety systems work. This is inherently local, hands-on work that will always require skilled humans.",
  },
  {
    icon: Zap,
    title: "Recession-Proof, Future-Proof Career",
    text: "Factories don't stop running during recessions — they still need maintenance and automation support. The transition to net zero, smart manufacturing, and Industry 4.0 means more automation investment, not less. Engineers who combine PLC skills with AI capabilities are the most valuable professionals in the sector.",
  },
];

const faqs = [
  {
    q: "Do I need prior experience in automation or engineering?",
    a: "No prior experience is required. Both courses start with Phase 0 — 12+ hours of pre-recorded foundation sessions covering Basic Electrical, Electronics, Pneumatics, and PLC fundamentals from scratch. This means even complete beginners and career switchers can follow the programme.",
  },
  {
    q: "What qualifications do I get after completing the course?",
    a: "You receive a CPD Accredited certificate from EDWartens, recognised by UK employers. Our courses are listed on the UK Register of Learning Providers (UKRLP).",
  },
  {
    q: "How long are the training programmes?",
    a: "Both the Professional Module and AI Module are 5 days of intensive classroom training (BST 9:00 AM – 5:00 PM) plus 12+ hours of pre-recorded foundation sessions to complete before class. The total learning time is approximately 52+ hours per course.",
  },
  {
    q: "What is the difference between the Professional Module and AI Module?",
    a: "Both share the same Phase 0 foundation. The Professional Module focuses on Siemens PLC programming, HMI development, and WinCC SCADA — the core skills for traditional automation roles. The AI Module covers AI and Machine Learning applications: predictive maintenance, computer vision, and AI-powered SCADA optimisation — for engineers who want to specialise in Industry 4.0.",
  },
  {
    q: "Do you offer career support after the course?",
    a: "Yes, we provide career support including CV workshops, interview preparation, LinkedIn optimisation, and job search guidance. This is educational and advisory support. Wartens does not guarantee employment, job placement, or interview outcomes. Career outcomes depend entirely on individual effort, qualifications, and market conditions.",
  },
  {
    q: "Can I attend training online instead of in person?",
    a: "Yes. We offer live online sessions with remote lab access via FactoryIO for the Professional Module. You will work on the same projects and assessments as classroom students, with real-time instructor support.",
  },
  {
    q: "What should I bring to in-person training?",
    a: "Just bring a laptop with Windows 10 or later. We provide all software licences, PLC hardware, and training materials. The class runs from 9:00 AM to 5:00 PM with breaks at 10:30, 1:00, and 3:30.",
  },
  {
    q: "Are there any financing or instalment options?",
    a: "Yes. We offer flexible payment plans. If instalment finance through a third-party provider (e.g., Klarna) is offered and not approved, you must pay the remaining amount before training begins. Contact our admissions team to discuss options.",
  },
  {
    q: "What is the class size?",
    a: "We keep our batches small — maximum 15 students per batch — to ensure each participant gets enough hands-on time with equipment and personalised attention from instructors.",
  },
  {
    q: "What is the refund policy?",
    a: "You may request cancellation and refund within 7 calendar days of payment by submitting a written request to info@wartens.com. After 7 days, fees become non-refundable. Full terms are available on our Terms & Conditions page.",
  },
];

export default function TrainingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<"professional" | "ai">(
    "professional"
  );

  const currentWeek =
    activeModule === "professional" ? profWeek : aiWeek;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/stock/classroom-training.jpg"
            alt="EDWartens classroom training facility"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/90 to-[#0a0a14]/70" />
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Training
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            How Our <span className="gradient-text">Training</span> Works
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Intensive, hands-on automation training delivered at our Milton
            Keynes facility and online. Learn to program Siemens PLCs, design
            SCADA systems, and build AI-powered automation solutions using
            industry-standard tools.
          </p>
        </div>
      </section>

      {/* ===== WHY AUTOMATION — THE OPPORTUNITY ===== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              The Opportunity
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Why Automation Is the{" "}
              <span className="gradient-text">
                Most Future-Proof Career
              </span>
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto leading-relaxed">
              In an era where AI is disrupting many industries, automation
              engineering stands apart. PLCs control physical machinery —
              no chatbot or language model can replace a human engineer
              commissioning a production line, wiring a control panel, or
              troubleshooting a live factory. Here&apos;s why this career
              is uniquely secure.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyAutomation.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass-card rounded-xl p-6 hover:border-neon-green/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-neon-green" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Key Stats */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              {
                stat: "2.1M",
                label: "Engineering roles to fill by 2030",
                source: "Engineering UK",
              },
              {
                stat: "180,000+",
                label: "Manufacturing firms in the UK",
                source: "Make UK",
              },
              {
                stat: "£45,000+",
                label: "Average automation engineer salary",
                source: "Indeed, Glassdoor",
              },
            ].map((item) => (
              <div
                key={item.stat}
                className="glass-card rounded-xl p-6 text-center"
              >
                <p className="text-3xl font-bold gradient-text mb-1">
                  {item.stat}
                </p>
                <p className="text-sm text-text-secondary">
                  {item.label}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  Source: {item.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Modes */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              Delivery Modes
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Multiple Ways to{" "}
              <span className="gradient-text">Learn</span>
            </h2>
          </div>

          {/* Training Facility Image Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { src: "/images/stock/hands-on-training.jpg", alt: "Hands-on PLC training at EDWartens facility" },
              { src: "/images/stock/plc-training.jpg", alt: "Students working with Siemens PLCs" },
              { src: "/images/stock/students-learning.jpg", alt: "Interactive classroom learning environment" },
            ].map((img) => (
              <div key={img.src} className="relative h-48 rounded-xl overflow-hidden border border-white/[0.06]">
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/80 to-transparent" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {deliveryModes.map((mode) => (
              <div
                key={mode.title}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${mode.color}/10 flex items-center justify-center mb-5`}
                >
                  <mode.icon size={24} className={`text-${mode.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {mode.title}
                </h3>
                <p className={`text-sm text-${mode.color} mb-3`}>
                  {mode.location}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {mode.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COURSE SYLLABUS WITH TABS ===== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              Course Structure
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Day-by-Day{" "}
              <span className="gradient-text">Syllabus</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              Both courses run for 5 days (BST 9:00 AM – 5:00 PM) with
              breaks. Classes include 8 hours of training daily. Choose a
              module below to see the full breakdown.
            </p>

            {/* Module Tabs */}
            <div className="inline-flex rounded-xl bg-dark-tertiary p-1 gap-1">
              <button
                onClick={() => setActiveModule("professional")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeModule === "professional"
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                Professional Module
              </button>
              <button
                onClick={() => setActiveModule("ai")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeModule === "ai"
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                AI Module
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {currentWeek.map((day, i) => (
              <div
                key={`${activeModule}-${day.day}`}
                className="glass-card rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="flex items-center gap-4 sm:w-56 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      i === 0
                        ? "bg-purple/10"
                        : "bg-neon-blue/10"
                    }`}
                  >
                    {i === 0 ? (
                      <BookOpen
                        size={18}
                        className="text-purple"
                      />
                    ) : (
                      <Calendar
                        size={18}
                        className="text-neon-blue"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {day.day}
                    </p>
                    <p className="text-xs text-neon-blue">
                      {day.label}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">
                    {day.focus}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {day.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Schedule */}
          <div className="mt-8 glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 text-center">
              Daily Schedule (BST)
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {[
                { time: "9:00–10:30", label: "Class", type: "class" },
                { time: "10:30–10:45", label: "Break", type: "break" },
                { time: "10:45–1:00", label: "Class", type: "class" },
                { time: "1:00–1:30", label: "Break", type: "break" },
                { time: "1:30–3:30", label: "Class", type: "class" },
                { time: "3:30–3:45", label: "Break", type: "break" },
                { time: "3:45–5:00", label: "Class", type: "class" },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className={`rounded-lg py-3 px-1 ${
                    slot.type === "class"
                      ? "bg-neon-blue/10 border border-neon-blue/20"
                      : "bg-white/[0.03]"
                  }`}
                >
                  <p className="text-[10px] text-text-muted">{slot.time}</p>
                  <p
                    className={`font-medium text-xs ${
                      slot.type === "class"
                        ? "text-neon-blue"
                        : "text-text-muted"
                    }`}
                  >
                    {slot.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href={
                activeModule === "professional"
                  ? "/courses/professional"
                  : "/courses/ai-module"
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              View Full{" "}
              {activeModule === "professional"
                ? "Professional"
                : "AI"}{" "}
              Module Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Used */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              Industry Tools
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Tools You Will{" "}
              <span className="gradient-text">Master</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                    <Cpu size={18} className="text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {tool.vendor}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              What to Expect
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Your Training{" "}
              <span className="gradient-text">Experience</span>
            </h2>
          </div>

          {/* Experience Image Banner */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-12 border border-white/[0.06]">
            <Image
              src="/images/stock/engineering-lab.jpg"
              alt="EDWartens engineering lab and training equipment"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-semibold text-lg">Our Training Facility</p>
              <p className="text-text-secondary text-sm">Fully equipped with Siemens hardware, industrial panels, and simulation software</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Small Batch Sizes",
                text: "Maximum 15 students per batch for personalised instruction and ample hands-on time with PLC hardware and software.",
              },
              {
                icon: Wrench,
                title: "Real Equipment",
                text: "Work with Siemens S7-1200 PLCs, industrial panels, sensors, and actuators. Connect to FactoryIO simulation for realistic scenarios.",
              },
              {
                icon: GraduationCap,
                title: "CPD Accredited",
                text: "Earn a CPD Accredited certificate recognised by UK employers. Verified through our online portal. UKRLP registered.",
              },
              {
                icon: Clock,
                title: "Intensive Schedule",
                text: "BST 9:00 AM to 5:00 PM daily with breaks at 10:30, 1:00, and 3:30. Theory and practical sessions balanced throughout.",
              },
              {
                icon: BookOpen,
                title: "12+ Hours Recorded Content",
                text: "Both modules include lifetime access to pre-recorded foundation sessions for revision and reference before and after class.",
              },
              {
                icon: Zap,
                title: "Career Support",
                text: "CV workshops, interview prep, LinkedIn optimisation, and job search guidance. Career support is advisory only — employment is not guaranteed.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-neon-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === i ? null : i)
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-text-muted flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Ready to Start Your{" "}
            <span className="gradient-text">Automation Career</span>?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Book a free consultation to discuss which training programme
            is right for you. Our admissions team will help you every
            step of the way.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Book a Consultation <ArrowRight size={16} />
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

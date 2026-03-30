import Image from "next/image";
import { Award, Briefcase, GraduationCap, MapPin, Linkedin, Wrench, Cpu, Zap, Globe } from "lucide-react";

export const metadata = {
  title: "Meet Your Trainers | EDWartens UK",
};

const trainers = [
  {
    name: "Allwyn Joseph",
    role: "Lead Trainer — Online Training",
    title: "Control System Engineer",
    photo: "/images/trainers/allwyn-joseph.png",
    location: "Milton Keynes, UK (Remote)",
    linkedin: "https://www.linkedin.com/in/allwyn-joseph",
    type: "online",
    bio: `Allwyn Joseph is an accomplished Control System Engineer and the lead trainer for EDWartens UK's online Professional Module. With a strong foundation in instrumentation and electrical engineering, Allwyn brings years of hands-on experience from Lambton College's Research & Innovation Centre in Ontario, Canada, where he contributed to cutting-edge R&D projects in industrial automation and process control.

What sets Allwyn apart is his rare combination of deep technical expertise across multiple PLC platforms and his ability to make complex automation concepts accessible to learners of all backgrounds. Having worked on multidisciplinary projects involving automated control systems, data acquisition, wireless communication, and control architecture migration, he brings real-world industrial scenarios directly into the classroom.`,
    expertise: [
      "Siemens TIA Portal (S7-1200/1500)",
      "Allen-Bradley Studio 5000 Logix",
      "Schneider, Omron, Delta PLCs",
      "SCADA: WinCC, FactoryTalk View, Wonderware InTouch, Vijeo Citect",
      "DCS: ABB 800xA, ABB Symphony+, Emerson DeltaV",
      "HMI: Maple Systems, Horner, Unitronix, EBPro",
      "Robot Programming: Fanuc LR Mate 200id, Fanuc Delta M-3iA",
      "Python, JavaScript, Embedded C, Arduino",
      "Panel Wiring, Circuit Board Design & Troubleshooting",
      "AutoCAD, SolidWorks, 3D Printing",
    ],
    education: [
      { degree: "Diploma — Instrumentation & Control Engineering Technology", school: "Lambton College, Ontario, Canada", year: "2018–2020" },
      { degree: "BTech — Electrical, Electronics & Communications Engineering", school: "Viswajyothi College of Engineering, Kerala, India", year: "2013–2017" },
    ],
    experience: [
      { role: "Control System Engineer", company: "Wartens Ltd", period: "Dec 2025 – Present" },
      { role: "Instrumentation & Control Research Technician", company: "Lambton College R&I, Canada", period: "Nov 2021 – Dec 2024 (3+ years)" },
      { role: "Research Technician", company: "Lambton College, Canada", period: "Feb 2021 – Nov 2021" },
    ],
    quote: "My goal is to give every student not just theoretical knowledge, but the confidence to walk into any industrial environment and program a PLC, configure a SCADA system, or troubleshoot a control panel — from day one.",
  },
  {
    name: "Shahul Hameed, MIET",
    role: "Practical Trainer — Milton Keynes",
    title: "Automation Engineer | PLC Programmer | MIET",
    photo: null,
    location: "Bristol, UK",
    linkedin: "https://www.linkedin.com/in/shahul-hameed-miet",
    type: "practical",
    bio: `Shahul Hameed is a qualified Automation and Maintenance Engineer who leads the hands-on practical sessions at EDWartens UK's Milton Keynes training centre. With a Master's degree in Automation, Control and Robotics from Sheffield Hallam University and years of real-world experience in the UK's logistics and automation sector, Shahul bridges the gap between academic theory and industrial practice.

Shahul's unique background as both an academic (former Assistant Professor in Electronics Engineering) and a practising automation engineer gives him an exceptional ability to teach. He understands how students learn, what challenges they face, and how to build confidence through hands-on practice with real industrial equipment.`,
    expertise: [
      "Siemens TIA Portal — PLC Programming & Configuration",
      "SCADA/HMI — WinCC, FactoryTalk",
      "Electrical & Mechanical Maintenance",
      "Conveyors, Motors, Sortation Systems, Destackers",
      "VFDs, Field Instrumentation, Industrial Robotics",
      "18th Edition (BS 7671) — UK Wiring Regulations",
      "Preventive Maintenance, Downtime Reduction, OEE Improvement",
      "Panel Wiring & Commissioning",
    ],
    education: [
      { degree: "MSc — Automation, Control and Robotics", school: "Sheffield Hallam University, UK", year: "2023–2024" },
      { degree: "MEng — VLSI Design", school: "Anna University Chennai, India", year: "2011–2013" },
    ],
    experience: [
      { role: "Site Automation Engineer", company: "Gist Limited, Bristol", period: "Feb 2025 – Present" },
      { role: "Junior Commissioning Engineer", company: "Wartens Ltd", period: "Jul 2024 – Dec 2024" },
      { role: "Assistant Professor — Electronics Engineering", company: "UKF College of Engineering, India", period: "Oct 2019 – Dec 2022 (3 years)" },
    ],
    quote: "The practical session is where everything clicks. Students who were unsure about their PLC skills leave with the confidence that they can handle real industrial equipment.",
  },
  {
    name: "Mohammed Ansel",
    role: "Practical Trainer — Milton Keynes",
    title: "Maintenance Engineer | Multi-Skilled Engineer",
    photo: null,
    location: "London, UK",
    linkedin: null,
    type: "practical",
    bio: `Mohammed Ansel brings over 13 years of hands-on engineering experience spanning battery manufacturing, flour milling, warehouse automation, and world-class entertainment venues. As a practical trainer at EDWartens UK, he draws on his extensive multi-skilled background to teach students the real-world maintenance and troubleshooting skills that employers demand.

Currently a Maintenance Engineer at Merlin Entertainments (responsible for the London Eye, SEA LIFE Aquarium, and other iconic attractions), Mohammed works daily with PLC-controlled systems, SCADA/HMI interfaces, and complex mechanical, electrical, and pneumatic systems — giving students direct insight into what a working automation engineer does every day.`,
    expertise: [
      "Siemens PLC Programming — Ladder Diagram, Function Block Diagram",
      "SCADA & HMI — TIA Portal Configuration & Programming",
      "Mechanical, Electrical & Pneumatic Maintenance",
      "Field Instrumentation — Control Valves, Sensors, Transmitters",
      "Panel Wiring & Circuit Board Troubleshooting",
      "Embedded Systems — Arduino Programming",
      "PCB & Circuit Design — AutoCAD, KiCad, Proteus, SolidWorks",
      "8+ years Industrial Maintenance (Kuwait Flour Mills)",
    ],
    education: [
      { degree: "PG Diploma — Industrial Automation Engineering", school: "Wartens UK", year: "2025" },
      { degree: "BSc — Electronics & Computer Hardware", school: "Mahatma Gandhi University, India", year: "2008–2011" },
    ],
    experience: [
      { role: "Maintenance Engineer", company: "Merlin Entertainments (London Eye, SEA LIFE)", period: "Jun 2025 – Present" },
      { role: "Maintenance Engineer", company: "Kuwait Flour Mills & Bakeries", period: "Apr 2015 – Jul 2023 (8 years)" },
      { role: "Multi-Skilled Engineer", company: "National Batteries, India", period: "Mar 2008 – Mar 2013 (5 years)" },
    ],
    quote: "Real engineering is about solving problems under pressure. I teach students the troubleshooting mindset that makes the difference between a good engineer and a great one.",
  },
];

export default function TrainersPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Meet Your Trainers</h1>
        <p className="text-sm text-text-muted mt-1">
          Learn from experienced automation engineers who work in the industry every day
        </p>
      </div>

      {trainers.map((trainer) => (
        <div key={trainer.name} className="glass-card overflow-hidden">
          {/* Header */}
          <div className={`p-6 ${trainer.type === "online" ? "bg-neon-blue/[0.03] border-b border-neon-blue/10" : "bg-purple/[0.03] border-b border-purple/10"}`}>
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Photo */}
              <div className="shrink-0">
                {trainer.photo ? (
                  <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-white/[0.1]">
                    <Image
                      src={trainer.photo}
                      alt={trainer.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-purple/20 to-neon-blue/20 flex items-center justify-center border-2 border-white/[0.1]">
                    <span className="text-3xl font-bold text-text-primary">
                      {trainer.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{trainer.name}</h2>
                    <p className="text-sm text-neon-blue font-medium">{trainer.role}</p>
                    <p className="text-xs text-text-muted mt-0.5">{trainer.title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${
                    trainer.type === "online"
                      ? "bg-neon-blue/10 text-neon-blue border-neon-blue/20"
                      : "bg-purple/10 text-purple border-purple/20"
                  }`}>
                    {trainer.type === "online" ? "🎥 Online Training" : "🔧 Practical Training"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin size={12} /> {trainer.location}
                  </span>
                  {trainer.linkedin && (
                    <a
                      href={trainer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
                    >
                      <Linkedin size={12} /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="p-6 space-y-5">
            <div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {trainer.bio}
              </p>
            </div>

            {/* Quote */}
            {trainer.quote && (
              <blockquote className="border-l-2 border-neon-blue/30 pl-4 py-2 bg-neon-blue/[0.02] rounded-r-lg">
                <p className="text-sm text-text-secondary italic">&ldquo;{trainer.quote}&rdquo;</p>
              </blockquote>
            )}

            {/* Technical Expertise */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <Cpu size={14} className="text-neon-blue" /> Technical Expertise
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {trainer.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-neon-green" /> Industry Experience
              </h3>
              <div className="space-y-2">
                {trainer.experience.map((exp) => (
                  <div key={exp.role + exp.company} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{exp.role}</p>
                      <p className="text-[11px] text-text-muted">{exp.company} · {exp.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <GraduationCap size={14} className="text-purple" /> Education
              </h3>
              <div className="space-y-2">
                {trainer.education.map((edu) => (
                  <div key={edu.degree} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{edu.degree}</p>
                      <p className="text-[11px] text-text-muted">{edu.school} · {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* What to Expect */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-text-primary mb-3">What to Expect from Your Training</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-neon-blue/[0.03] border border-neon-blue/10">
            <Zap size={20} className="text-neon-blue mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Online Training (5 Days)</h3>
            <p className="text-xs text-text-muted mt-1">Live instructor-led sessions via Microsoft Teams with Allwyn. Hands-on PLC, HMI, and SCADA programming.</p>
          </div>
          <div className="p-4 rounded-lg bg-purple/[0.03] border border-purple/10">
            <Wrench size={20} className="text-purple mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Practical Session (1 Day)</h3>
            <p className="text-xs text-text-muted mt-1">Optional in-person session at our Milton Keynes centre with Shahul or Mohammed. Work with real industrial equipment.</p>
          </div>
          <div className="p-4 rounded-lg bg-neon-green/[0.03] border border-neon-green/10">
            <Globe size={20} className="text-neon-green mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Career Support</h3>
            <p className="text-xs text-text-muted mt-1">One-to-one career consultation, CV review, interview coaching, and placement assistance from the full team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

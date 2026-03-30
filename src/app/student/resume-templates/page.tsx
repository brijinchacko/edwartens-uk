import { Wrench, Cpu, Settings, Zap, PenTool, Cog, Cable, Download, Lightbulb } from "lucide-react";
import fs from "fs";
import path from "path";

const TEMPLATES = [
  {
    file: "01_Automation_Engineer_Resume.docx",
    name: "Automation Engineer Resume",
    role: "Automation Engineer",
    description:
      "Tailored for automation and control systems roles. Highlights PLC programming, SCADA systems, and industrial automation experience.",
    icon: Zap,
  },
  {
    file: "02_PLC_Programmer_Resume.docx",
    name: "PLC Programmer Resume",
    role: "PLC Programmer",
    description:
      "Focused on PLC programming expertise. Emphasises ladder logic, structured text, and HMI development skills.",
    icon: Cpu,
  },
  {
    file: "03_Maintenance_Engineer_Resume.docx",
    name: "Maintenance Engineer Resume",
    role: "Maintenance Engineer",
    description:
      "Designed for maintenance and reliability roles. Covers preventive maintenance, fault diagnosis, and equipment upkeep.",
    icon: Wrench,
  },
  {
    file: "04_Service_Engineer_Resume.docx",
    name: "Service Engineer Resume",
    role: "Service Engineer",
    description:
      "Ideal for field service and commissioning roles. Showcases on-site troubleshooting, customer communication, and technical support.",
    icon: Settings,
  },
  {
    file: "05_Design_Engineer_Resume.docx",
    name: "Design Engineer Resume",
    role: "Design Engineer",
    description:
      "Built for control panel design and electrical design roles. Features CAD proficiency, schematic design, and project delivery.",
    icon: PenTool,
  },
  {
    file: "06_Multiskilled_Engineer_Resume.docx",
    name: "Multiskilled Engineer Resume",
    role: "Multiskilled Engineer",
    description:
      "Versatile template for engineers with broad skill sets. Covers electrical, mechanical, and instrumentation capabilities.",
    icon: Cog,
  },
  {
    file: "07_Electrical_Engineer_Resume.docx",
    name: "Electrical Engineer Resume",
    role: "Electrical Engineer",
    description:
      "Focused on electrical engineering roles. Highlights power systems, wiring, testing, and compliance knowledge.",
    icon: Cable,
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileSize(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), "public", "resume-templates", filename);
    const stats = fs.statSync(filePath);
    return formatFileSize(stats.size);
  } catch {
    return "N/A";
  }
}

export default function ResumeTemplatesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Resume Templates</h1>
        <p className="text-text-muted mt-2">
          Download professionally crafted resume templates tailored for engineering roles in the UK.
          Each template is optimised for applicant tracking systems (ATS) and formatted to industry standards.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const fileSize = getFileSize(template.file);

          return (
            <div
              key={template.file}
              className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:border-neon-blue/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-neon-blue/10 text-neon-blue shrink-0">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary leading-snug">
                    {template.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{fileSize} &middot; DOCX</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed flex-1">
                {template.description}
              </p>

              <a
                href={`/resume-templates/${template.file}`}
                download
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors"
              >
                <Download size={16} />
                Download Template
              </a>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-text-primary">How to Use These Templates</h2>
        </div>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">1.</span>
            <span>Download the template that best matches your target role.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">2.</span>
            <span>Open the .docx file in Microsoft Word or Google Docs.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">3.</span>
            <span>Replace the placeholder text with your own details, experience, and qualifications.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">4.</span>
            <span>Tailor the skills section to match the specific job description you are applying for.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">5.</span>
            <span>Save as PDF before submitting to employers to preserve formatting.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue font-bold mt-0.5">6.</span>
            <span>Have your resume reviewed during your scheduled Resume Review session for feedback.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Course fee constants (all in pence for Stripe)
export const COURSE_FEE_NET = 2140; // £2,140
export const COURSE_FEE_VAT = 428; // 20% VAT
export const COURSE_FEE_TOTAL = 2568; // £2,568 inc VAT
export const COURSE_FEE_TOTAL_PENCE = 256800;
export const DEPOSIT_AMOUNT = 100; // £100
export const DEPOSIT_AMOUNT_PENCE = 10000;

// Slug to CourseType mapping
export const COURSE_SLUGS: Record<string, string> = {
  professional: "PROFESSIONAL_MODULE",
  "ai-module": "AI_MODULE",
};

export const COURSE_SLUG_REVERSE: Record<string, string> = {
  PROFESSIONAL_MODULE: "professional",
  AI_MODULE: "ai-module",
};

// Course display config
export const COURSE_CONFIG: Record<
  string,
  {
    title: string;
    subtitle: string;
    duration: string;
    description: string;
    topics: string[];
    phases: { phase: string; title: string; duration: string }[];
  }
> = {
  PROFESSIONAL_MODULE: {
    title: "Professional Module",
    subtitle: "Automation & PLC Engineering",
    duration: "5 Days + 12hrs Recorded Sessions",
    description:
      "Our flagship career-focused programme covering everything from basic electrical theory to Siemens PLC programming, HMI design, and WinCC SCADA. Includes CPD certification and dedicated career support.",
    topics: [
      "Basic Electrical & Electronics",
      "Pneumatics & Industrial Automation",
      "Siemens PLC & TIA Portal",
      "Advanced PLC Programming",
      "Siemens HMI Development",
      "WinCC SCADA Systems",
      "Factory-IO Simulation",
      "Career Preparation & Assessment",
    ],
    phases: [
      { phase: "Phase 0", title: "Foundation (Pre-recorded)", duration: "12+ hrs self-paced" },
      { phase: "Phase 1", title: "PLC Programming with Siemens TIA Portal", duration: "Day 1" },
      { phase: "Phase 2", title: "Advanced PLC Programming & Applications", duration: "Day 2" },
      { phase: "Phase 3", title: "HMI Development with Siemens TIA Portal", duration: "Day 3" },
      { phase: "Phase 4", title: "Introduction to SCADA (WinCC)", duration: "Day 4" },
      { phase: "Phase 5", title: "Advanced Features & Career Preparation", duration: "Day 5" },
    ],
  },
  AI_MODULE: {
    title: "AI Module",
    subtitle: "AI-Powered Industrial Automation",
    duration: "5 Days + 12hrs Recorded Sessions",
    description:
      "Cutting-edge programme combining PLC fundamentals with AI and Machine Learning for industrial automation. Learn predictive maintenance, computer vision for quality control, and AI-powered SCADA optimisation.",
    topics: [
      "Basic Electrical & Electronics",
      "AI & Machine Learning in Industry",
      "Python for Automation Engineers",
      "Predictive Maintenance with ML",
      "Computer Vision for Quality Control",
      "AI-Powered SCADA & Process Optimisation",
      "Digital Twin Concepts",
      "Career Preparation & Assessment",
    ],
    phases: [
      { phase: "Phase 0", title: "Foundation (Pre-recorded)", duration: "12+ hrs self-paced" },
      { phase: "Phase 1", title: "AI Fundamentals for Industrial Automation", duration: "Day 1" },
      { phase: "Phase 2", title: "Machine Learning for Predictive Maintenance", duration: "Day 2" },
      { phase: "Phase 3", title: "Computer Vision for Quality Control", duration: "Day 3" },
      { phase: "Phase 4", title: "AI-Powered SCADA & Process Optimisation", duration: "Day 4" },
      { phase: "Phase 5", title: "Career Preparation & Assessment", duration: "Day 5" },
    ],
  },
};

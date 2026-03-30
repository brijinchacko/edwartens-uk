const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("=== Fixing Course Structure ===");
  console.log("Recorded = Phase 0 (Foundation, self-paced, complementary)");
  console.log("Live Classes = Phase 1-4 (Main 5-day training)");
  console.log("Career Support = Phase 5 (Post-training)");

  // Get phases
  const phases = await p.phase.findMany({
    where: { course: "PROFESSIONAL_MODULE" },
    orderBy: { order: "asc" },
  });
  const phaseMap = {};
  phases.forEach(ph => { phaseMap[ph.number] = ph.id; });
  console.log("Phases:", phases.map(p => `${p.number}: ${p.name}`).join(", "));

  // Update phase names to match actual structure
  await p.phase.update({ where: { id: phaseMap[0] }, data: { name: "Foundation (Pre-recorded Sessions)", description: "Self-paced recorded sessions covering basic electrical, electronics, and industrial automation fundamentals. These are complementary to the main live training." } });
  await p.phase.update({ where: { id: phaseMap[1] }, data: { name: "Day 1-2: PLC Programming with Siemens TIA Portal", description: "Live instructor-led training covering PLC fundamentals, hardware configuration, ladder logic, and advanced programming with hands-on practice." } });
  await p.phase.update({ where: { id: phaseMap[2] }, data: { name: "Day 3: HMI Development with Siemens TIA Portal", description: "Live instructor-led training covering HMI hardware, screen design, PLC integration, and best practices for HMI development." } });
  await p.phase.update({ where: { id: phaseMap[3] }, data: { name: "Day 4-5: SCADA (WinCC) & Advanced Features", description: "Live instructor-led training covering WinCC SCADA systems, data acquisition, alarm management, trending, and advanced application development." } });
  await p.phase.update({ where: { id: phaseMap[4] }, data: { name: "Industrial Knowledge Base", description: "Reference material covering industrial communication protocols, instrumentation, pneumatics, mechanical systems, and safety standards." } });
  await p.phase.update({ where: { id: phaseMap[5] }, data: { name: "Career Support & Assessment", description: "Post-training career support including CV preparation, interview coaching, assessment, and placement assistance." } });
  console.log("Phase names updated");

  // Delete all existing sessions
  await p.sessionProgress.deleteMany({});
  await p.session.deleteMany({});
  console.log("Old sessions cleared");

  // ═══════════════════════════════════════════════════════
  // PHASE 0: Foundation (Pre-recorded, complementary)
  // ═══════════════════════════════════════════════════════
  const phase0Sessions = [
    // Software Setup
    { title: "TIA Portal V19 and PLCSIM Installation Guide", description: "Complete guide to installing Siemens TIA Portal V19 and PLCSIM — the essential software tools for this course.\n\n• System requirements verification (Windows 10/11, 8GB+ RAM)\n• Downloading from Siemens Industry Support Portal\n• Step-by-step installation of all components\n• License activation via Automation License Manager\n• PLCSIM installation for PLC simulation\n• Troubleshooting common installation issues", videoUrl: null, videoPlatform: null, videoId: null, order: 1, isMandatory: false },

    // Recorded Foundation Videos
    { title: "Introduction to Industrial Automation", description: "Comprehensive overview of industrial automation — what it is, why it matters, and career opportunities.\n\n• Evolution from manual operations to Industry 4.0\n• Core components: sensors, actuators, controllers, networks\n• Types of automation: fixed, programmable, flexible\n• The role of PLC, SCADA, and HMI\n• Career opportunities in the UK automation industry", videoUrl: "https://vimeo.com/964342820", videoPlatform: "vimeo", videoId: "964342820", order: 2, isMandatory: false },

    { title: "Introduction to PLC", description: "Fundamentals of Programmable Logic Controllers — the brain behind every automated system.\n\n• What is a PLC and how it differs from general-purpose computers\n• PLC architecture: CPU, memory, I/O modules, power supply\n• The PLC scan cycle: read inputs → execute logic → update outputs\n• Overview of major PLC brands: Siemens, Allen-Bradley, Schneider\n• Basic programming concepts using Ladder Logic", videoUrl: "https://vimeo.com/965354223", videoPlatform: "vimeo", videoId: "965354223", order: 3, isMandatory: false },

    { title: "Basic Electronics and Electricals", description: "Essential electrical and electronic principles every automation engineer must understand.\n\n• Voltage, current, resistance, and Ohm's Law\n• AC vs DC circuits\n• Essential components: resistors, capacitors, diodes, transistors\n• Series and parallel circuits\n• Electrical safety fundamentals\n• Digital electronics basics", videoUrl: "https://vimeo.com/964343497", videoPlatform: "vimeo", videoId: "964343497", order: 4, isMandatory: false },

    // Recorded topic videos (Electrical)
    { title: "Basic Electrical Concepts (Current, Voltage, Resistance, Ohm's Law)", description: "Master the foundational electrical concepts that form the basis of all automation work.\n\n• Current (I): measured in Amperes\n• Voltage (V): measured in Volts\n• Resistance (R): measured in Ohms\n• Ohm's Law: V = IR\n• Power: P = VI\n• Kirchhoff's Laws for circuit analysis", videoUrl: "https://www.youtube.com/watch?v=kcL2_D33k3o", videoPlatform: "youtube", videoId: "kcL2_D33k3o", order: 5, isMandatory: false },

    { title: "Power Systems (Single Phase, Three Phase, Transformers)", description: "Understanding power systems critical for industrial electrical equipment.\n\n• Single-phase power: UK mains 230V, 50Hz\n• Three-phase power: 400V industrial systems\n• Transformers: step-up, step-down, turns ratio\n• Star and Delta configurations", videoUrl: "https://www.youtube.com/watch?v=u0SsejDCVkU", videoPlatform: "youtube", videoId: "u0SsejDCVkU", order: 6, isMandatory: false },

    { title: "Motors (Induction, Servo, VFD/VSD, Synchronous)", description: "Deep dive into electric motors used in industrial automation.\n\n• Three-phase induction motors\n• Servo motors for precision control\n• VFD/VSD for speed control\n• Motor nameplate data interpretation", videoUrl: "https://www.youtube.com/watch?v=g7jFGOn6xfU", videoPlatform: "youtube", videoId: "g7jFGOn6xfU", order: 7, isMandatory: false },

    { title: "Motor Starters (DOL, Star-Delta, Soft Starters)", description: "Different methods of starting motors and when to use each.\n\n• DOL: Direct On Line for small motors\n• Star-Delta: Reduced starting current\n• Soft Starters: Gradual voltage increase\n• VFD Starting: Complete speed control", videoUrl: "https://www.youtube.com/watch?v=LvYZ7_wp8Tk", videoPlatform: "youtube", videoId: "LvYZ7_wp8Tk", order: 8, isMandatory: false },

    { title: "Sensors and Instrumentation Overview", description: "Overview of key sensors used in industrial automation.\n\n• Proximity Sensors: Inductive, Capacitive, Optical\n• Temperature Sensors: RTD, Thermocouples\n• Pressure and Flow Sensors\n• Level Sensors\n• 4-20mA and HART protocols", videoUrl: "https://www.youtube.com/watch?v=RO1P8jGYU78", videoPlatform: "youtube", videoId: "RO1P8jGYU78", order: 9, isMandatory: false },

    { title: "Industrial Safety Fundamentals", description: "Essential safety knowledge for working in industrial environments.\n\n• Lockout-Tagout (LOTO) procedures\n• Electrical safety standards\n• PPE requirements\n• Machine safety: emergency stops, interlocks\n• Risk assessment basics", videoUrl: "https://www.youtube.com/watch?v=Np14M0du758", videoPlatform: "youtube", videoId: "Np14M0du758", order: 10, isMandatory: false },
  ];

  // ═══════════════════════════════════════════════════════
  // PHASE 1: Day 1-2: PLC Programming (LIVE CLASS)
  // ═══════════════════════════════════════════════════════
  const phase1Sessions = [
    { title: "Day 1: Introduction to Siemens TIA Portal", description: "**LIVE CLASS SESSION**\n\nYour instructor will guide you through the TIA Portal environment — the integrated engineering framework for all Siemens automation products.\n\n**Topics covered:**\n• Overview of TIA Portal interface and navigation\n• Creating your first project\n• Hardware configuration of S7-1200/1500 PLCs\n• Understanding the project tree structure\n• Compiling and downloading programs", videoUrl: null, videoPlatform: null, videoId: null, order: 1, isMandatory: true },

    { title: "Day 1: Overview of PLC Hardware and Architecture", description: "**LIVE CLASS SESSION**\n\nUnderstanding the physical PLC system and how it operates.\n\n**Topics covered:**\n• PLC CPU, memory types (load, work, retentive)\n• Digital and analog input/output modules\n• Power supply requirements\n• Communication modules (PROFINET, PROFIBUS)\n• PLC rack configuration and addressing", videoUrl: null, videoPlatform: null, videoId: null, order: 2, isMandatory: true },

    { title: "Day 1: Basics of Ladder Logic Programming", description: "**LIVE CLASS SESSION**\n\nLearn the most widely used PLC programming language.\n\n**Topics covered:**\n• Normally Open (NO) and Normally Closed (NC) contacts\n• Output coils and latching circuits\n• Set/Reset (SR) instructions\n• Timers: TON, TOF, TP\n• Counters: CTU, CTD, CTUD\n• Comparison and math operations", videoUrl: null, videoPlatform: null, videoId: null, order: 3, isMandatory: true },

    { title: "Day 1: Hands-on Practice — Creating PLC Programs", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nHands-on exercises creating and testing PLC programs in TIA Portal with PLCSIM.\n\n**Exercises:**\n• Motor start/stop circuit with interlocking\n• Traffic light sequence controller\n• Conveyor belt control with sensor inputs\n• Timer-based batch mixing process\n• Troubleshooting deliberately introduced faults", videoUrl: null, videoPlatform: null, videoId: null, order: 4, isMandatory: true },

    { title: "Day 2: Advanced PLC Programming Concepts", description: "**LIVE CLASS SESSION**\n\nBuilding on Day 1 fundamentals with advanced programming techniques.\n\n**Topics covered:**\n• Function Blocks (FB) and Function Calls (FC)\n• Data Blocks (DB) — Global and Instance\n• Structured programming techniques\n• Organization Blocks: OB1, OB100, OB82\n• Indirect addressing and pointers\n• SCL/Structured Text programming", videoUrl: null, videoPlatform: null, videoId: null, order: 5, isMandatory: true },

    { title: "Day 2: Simulation and Testing of PLC Programs", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nUsing PLCSIM for comprehensive program testing.\n\n**Topics covered:**\n• Setting up PLCSIM simulation environment\n• Monitoring and forcing variables\n• Watch tables and trace recording\n• Cross-referencing for debugging\n• Online/offline comparison\n• Program download and go online", videoUrl: null, videoPlatform: null, videoId: null, order: 6, isMandatory: true },

    { title: "Day 2: Practical Applications and Case Studies", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nReal-world industrial automation case studies.\n\n**Topics covered:**\n• Water treatment plant control system\n• Conveyor sorting system with multiple sensors\n• Temperature control loop implementation\n• Batch process automation\n• Industrial motor control circuits", videoUrl: null, videoPlatform: null, videoId: null, order: 7, isMandatory: true },
  ];

  // ═══════════════════════════════════════════════════════
  // PHASE 2: Day 3: HMI Development (LIVE CLASS)
  // ═══════════════════════════════════════════════════════
  const phase2Sessions = [
    { title: "Day 3: Introduction to HMI and Industrial Automation", description: "**LIVE CLASS SESSION**\n\nUnderstanding HMI systems and their role in modern automation.\n\n**Topics covered:**\n• What is HMI and why is it essential\n• Types of HMI: panel-based, PC-based, mobile\n• Overview of Siemens HMI hardware (KTP, Comfort, Unified)\n• HMI in the context of the automation pyramid\n• Communication between HMI and PLC", videoUrl: null, videoPlatform: null, videoId: null, order: 1, isMandatory: true },

    { title: "Day 3: Creating HMI Projects in TIA Portal", description: "**LIVE CLASS SESSION**\n\nBuilding your first HMI project from scratch.\n\n**Topics covered:**\n• Creating a new HMI project and device configuration\n• Establishing PLC-HMI connections\n• Understanding HMI tags and PLC tag mapping\n• Screen templates and global settings\n• Navigation between screens", videoUrl: null, videoPlatform: null, videoId: null, order: 2, isMandatory: true },

    { title: "Day 3: Designing HMI Screens and Navigation", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nDesigning professional, user-friendly operator screens.\n\n**Topics covered:**\n• Layout principles for industrial HMI\n• Using graphic objects: buttons, indicators, gauges, bars\n• Animations and dynamic objects\n• Input/output fields linked to PLC tags\n• Screen navigation and popup windows\n• User management and access levels", videoUrl: null, videoPlatform: null, videoId: null, order: 3, isMandatory: true },

    { title: "Day 3: Integrating HMI with PLC Programs", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nConnecting HMI screens to live PLC data.\n\n**Topics covered:**\n• Tag-based data exchange between HMI and PLC\n• Alarm configuration and management\n• Trend displays for real-time data monitoring\n• Recipe management for batch processes\n• Data logging and historical data\n• Testing and simulation of HMI projects", videoUrl: null, videoPlatform: null, videoId: null, order: 4, isMandatory: true },

    { title: "Day 3: Best Practices for HMI Development", description: "**LIVE CLASS SESSION**\n\nIndustry standards and best practices for professional HMI design.\n\n**Topics covered:**\n• ISA-101 HMI design standards\n• Colour coding and alarm prioritisation\n• Performance optimisation\n• Deployment and commissioning\n• Remote access and web-based HMI\n• Common mistakes and how to avoid them", videoUrl: null, videoPlatform: null, videoId: null, order: 5, isMandatory: true },
  ];

  // ═══════════════════════════════════════════════════════
  // PHASE 3: Day 4-5: SCADA & Advanced Features (LIVE CLASS)
  // ═══════════════════════════════════════════════════════
  const phase3Sessions = [
    { title: "Day 4: Overview of WinCC SCADA System", description: "**LIVE CLASS SESSION**\n\nIntroduction to WinCC — Siemens' industry-leading SCADA platform.\n\n**Topics covered:**\n• What is SCADA and its role in industrial automation\n• WinCC architecture: server, client, web client\n• Exploring the WinCC interface and navigation\n• Understanding the WinCC project structure\n• Runtime vs configuration mode", videoUrl: null, videoPlatform: null, videoId: null, order: 1, isMandatory: true },

    { title: "Day 4: Tags and Data Acquisition", description: "**LIVE CLASS SESSION**\n\nThe foundation of SCADA — connecting to real-time process data.\n\n**Topics covered:**\n• Internal and external tags\n• Tag-based data acquisition from PLCs\n• Communication channels and drivers\n• Data types and scaling\n• Tag groups and archiving", videoUrl: null, videoPlatform: null, videoId: null, order: 2, isMandatory: true },

    { title: "Day 4: Creating SCADA Graphics and Objects", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nBuilding professional SCADA process graphics.\n\n**Topics covered:**\n• Graphics designer tools and objects\n• Creating process flow diagrams\n• Dynamic objects linked to tags\n• Faceplate creation for reusable components\n• Library management\n• Hands-on: Building a simple SCADA application", videoUrl: null, videoPlatform: null, videoId: null, order: 3, isMandatory: true },

    { title: "Day 5: Dynamic Graphics and Animation", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nAdvanced visualisation techniques for operator interfaces.\n\n**Topics covered:**\n• Dynamic colour changes and visibility\n• Bar graphs, gauges, and meters\n• Animation with process data\n• Custom symbols and smart objects\n• Multi-language support", videoUrl: null, videoPlatform: null, videoId: null, order: 4, isMandatory: true },

    { title: "Day 5: Alarm and Event Management", description: "**LIVE CLASS SESSION**\n\nConfiguring comprehensive alarm systems for process monitoring.\n\n**Topics covered:**\n• Alarm classes and priorities\n• Analog and digital alarms\n• Alarm acknowledgement and escalation\n• Alarm logging and analysis\n• Best practices for alarm management", videoUrl: null, videoPlatform: null, videoId: null, order: 5, isMandatory: true },

    { title: "Day 5: Trending and Historical Data Analysis", description: "**LIVE CLASS SESSION — PRACTICAL**\n\nCapturing and analysing process data over time.\n\n**Topics covered:**\n• Online and offline trend displays\n• Historical data archiving\n• Report generation\n• Data export and analysis\n• Performance dashboards", videoUrl: null, videoPlatform: null, videoId: null, order: 6, isMandatory: true },

    { title: "Day 5: Best Practices and Project Review", description: "**LIVE CLASS SESSION**\n\nWrapping up the 5-day training with industry best practices.\n\n**Topics covered:**\n• WinCC application development best practices\n• Security and user management in SCADA\n• Network architecture for industrial SCADA\n• Project review and Q&A\n• Course completion assessment overview\n• Next steps: career support and certification", videoUrl: null, videoPlatform: null, videoId: null, order: 7, isMandatory: true },
  ];

  // ═══════════════════════════════════════════════════════
  // PHASE 4: Industrial Knowledge Base (Reference Material)
  // ═══════════════════════════════════════════════════════
  const phase4Sessions = [
    { title: "Industrial Communication Protocols", description: "Reference material covering the major protocols used in industrial networks.\n\n• PROFINET and PROFIBUS\n• Modbus TCP and Ethernet/IP\n• OPC-UA and MQTT for IoT\n• Serial communication (RS232, RS485)", videoUrl: "https://www.youtube.com/watch?v=HLziLmaYsO0", videoPlatform: "youtube", videoId: "HLziLmaYsO0", order: 1, isMandatory: false },

    { title: "Instrumentation and Sensors", description: "Comprehensive reference on industrial sensors and measurement.\n\n• Proximity, temperature, pressure, flow, level sensors\n• 4-20mA, HART, and analog signals\n• Calibration and signal conditioning\n• PID control fundamentals", videoUrl: "https://www.youtube.com/watch?v=IB1Ir4oCP5k", videoPlatform: "youtube", videoId: "IB1Ir4oCP5k", order: 2, isMandatory: false },

    { title: "Pneumatics and Hydraulics", description: "Reference material on fluid power systems.\n\n• Pneumatic valves, cylinders, and actuators\n• Hydraulic systems and components\n• Troubleshooting pneumatic/hydraulic systems", videoUrl: "https://www.youtube.com/watch?v=bXXL-0sf8gs", videoPlatform: "youtube", videoId: "bXXL-0sf8gs", order: 3, isMandatory: false },

    { title: "Maintenance and Reliability", description: "Reference on predictive and preventive maintenance strategies.\n\n• Vibration analysis and thermography\n• Root cause analysis (5 Why, Fishbone)\n• Condition monitoring techniques\n• CMMS and TPM strategies", videoUrl: "https://www.youtube.com/watch?v=k6eJqLGRGAQ", videoPlatform: "youtube", videoId: "k6eJqLGRGAQ", order: 4, isMandatory: false },

    { title: "Safety Standards (IEC 61508, ISO 13849, ATEX)", description: "Reference on safety standards and hazardous area classification.\n\n• Functional safety: SIL levels\n• Machine safety: Performance Levels\n• ATEX and hazardous area equipment\n• Electrical safety standards", videoUrl: "https://www.youtube.com/watch?v=SPwk0NpUyx8", videoPlatform: "youtube", videoId: "SPwk0NpUyx8", order: 5, isMandatory: false },
  ];

  // ═══════════════════════════════════════════════════════
  // PHASE 5: Career Support & Assessment
  // ═══════════════════════════════════════════════════════
  const phase5Sessions = [
    { title: "Career Consultation — One to One Session", description: "**SCHEDULED SESSION**\n\nPersonalised one-to-one career consultation with your counsellor.\n\n• CV review and optimisation for automation roles\n• LinkedIn profile enhancement\n• Job market overview and target companies\n• Interview preparation strategies\n• Salary expectations and negotiation tips", videoUrl: null, videoPlatform: null, videoId: null, order: 1, isMandatory: false },

    { title: "Resume Building for Automation Engineers", description: "Guidance on creating a professional CV that stands out.\n\n• Automation engineer CV structure\n• Highlighting PLC, SCADA, HMI skills\n• Project descriptions that impress recruiters\n• Keywords that pass ATS screening\n• Portfolio and project showcase", videoUrl: null, videoPlatform: null, videoId: null, order: 2, isMandatory: false },

    { title: "Interview Preparation", description: "Comprehensive interview preparation for automation engineering roles.\n\n• Common technical interview questions\n• PLC programming scenario questions\n• SCADA and HMI design discussions\n• Behavioural interview techniques\n• Mock interview practice", videoUrl: null, videoPlatform: null, videoId: null, order: 3, isMandatory: false },

    { title: "Course Assessment", description: "**ASSESSMENT**\n\nComplete the course assessment to earn your CPD certificate.\n\n• Theory assessment: 50 MCQ questions (80% pass mark)\n• Practical project submission\n• Both must be passed to receive CPD certification\n• You can retake the theory assessment if needed", videoUrl: null, videoPlatform: null, videoId: null, order: 4, isMandatory: true },
  ];

  // Create all sessions
  const allPhases = [
    { phaseId: phaseMap[0], sessions: phase0Sessions },
    { phaseId: phaseMap[1], sessions: phase1Sessions },
    { phaseId: phaseMap[2], sessions: phase2Sessions },
    { phaseId: phaseMap[3], sessions: phase3Sessions },
    { phaseId: phaseMap[4], sessions: phase4Sessions },
    { phaseId: phaseMap[5], sessions: phase5Sessions },
  ];

  let totalCreated = 0;
  for (const { phaseId, sessions } of allPhases) {
    for (const s of sessions) {
      await p.session.create({
        data: { ...s, phaseId },
      });
      totalCreated++;
    }
  }

  console.log("\nTotal sessions created:", totalCreated);

  // Verify
  const byPhase = await p.session.groupBy({
    by: ["phaseId"],
    _count: true,
  });
  for (const bp of byPhase) {
    const phase = phases.find(p => p.id === bp.phaseId);
    console.log(`  Phase ${phase?.number}: ${phase?.name} — ${bp._count} sessions`);
  }

  const withVideo = await p.session.count({ where: { videoUrl: { not: null } } });
  console.log("\nSessions with video:", withVideo, "/", totalCreated);

  await p.$disconnect();
}

main().catch(console.error);

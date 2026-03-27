import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------------------------------------------------------------------------
  // 1. Users
  // ---------------------------------------------------------------------------
  const superAdminPassword = await bcrypt.hash("Admin@2026!", 12);
  const adminPassword = await bcrypt.hash("admin2026!", 12);
  const salesLeadPassword = await bcrypt.hash("staff2026!", 12);
  const counsellorPassword = await bcrypt.hash("counsellor2026!", 12);
  const trainerPassword = await bcrypt.hash("trainer2026!", 12);
  const demoPassword = await bcrypt.hash("demo2026!", 12);

  // Primary Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: "jbc@wartens.com" },
    update: {},
    create: {
      email: "jbc@wartens.com",
      password: superAdminPassword,
      name: "JBC Admin",
      role: "SUPER_ADMIN",
      phone: "+44 333 33 98 394",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  // Secondary Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@edwartens.co.uk" },
    update: {},
    create: {
      email: "admin@edwartens.co.uk",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      phone: "+44 1234 567890",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  // Sales Lead (formerly Staff)
  const salesLeadUser = await prisma.user.upsert({
    where: { email: "staff@edwartens.co.uk" },
    update: {},
    create: {
      email: "staff@edwartens.co.uk",
      password: salesLeadPassword,
      name: "Staff Member",
      role: "SALES_LEAD",
      phone: "+44 1234 567891",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  // Admission Counsellor
  const counsellorUser = await prisma.user.upsert({
    where: { email: "counsellor@edwartens.co.uk" },
    update: {},
    create: {
      email: "counsellor@edwartens.co.uk",
      password: counsellorPassword,
      name: "Admission Counsellor",
      role: "ADMISSION_COUNSELLOR",
      phone: "+44 1234 567892",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  // Trainer
  const trainerUser = await prisma.user.upsert({
    where: { email: "trainer@edwartens.co.uk" },
    update: {},
    create: {
      email: "trainer@edwartens.co.uk",
      password: trainerPassword,
      name: "Lead Trainer",
      role: "TRAINER",
      phone: "+44 1234 567893",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@edwartens.co.uk" },
    update: {},
    create: {
      email: "demo@edwartens.co.uk",
      password: demoPassword,
      name: "Demo Student",
      role: "STUDENT",
      phone: "+44 7700 900123",
      dateOfBirth: new Date("1998-05-15"),
      address: "123 High Street, Milton Keynes, MK1 1AA",
      emergencyName: "Jane Student",
      emergencyPhone: "+44 7700 900124",
      isActive: true,
      onboarded: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  console.log("  Users created");

  // ---------------------------------------------------------------------------
  // 2. Employee records
  // ---------------------------------------------------------------------------
  const superAdminEmployee = await prisma.employee.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      department: "Management",
      specialization: "Executive Administration",
      bio: "Super administrator for EDWartens UK.",
    },
  });

  const adminEmployee = await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      department: "Management",
      specialization: "Administration",
      bio: "System administrator for EDWartens UK.",
    },
  });

  const salesLeadEmployee = await prisma.employee.upsert({
    where: { userId: salesLeadUser.id },
    update: {},
    create: {
      userId: salesLeadUser.id,
      department: "Sales",
      specialization: "Lead Management & Admissions",
      bio: "Sales lead and admissions coordinator.",
    },
  });

  const counsellorEmployee = await prisma.employee.upsert({
    where: { userId: counsellorUser.id },
    update: {},
    create: {
      userId: counsellorUser.id,
      department: "Admissions",
      specialization: "Student Counselling",
      bio: "Admission counsellor for prospective students.",
    },
  });

  const trainerEmployee = await prisma.employee.upsert({
    where: { userId: trainerUser.id },
    update: {},
    create: {
      userId: trainerUser.id,
      department: "Training",
      specialization: "PLC & AI Automation",
      bio: "Lead trainer and instructor for PLC and AI modules.",
    },
  });

  console.log("  Employee records created");

  // ---------------------------------------------------------------------------
  // 3. Student record for demo student
  // ---------------------------------------------------------------------------
  const demoStudent = await prisma.student.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      course: "PROFESSIONAL_MODULE",
      status: "ACTIVE",
      currentPhase: 1,
      qualification: "BEng Electrical Engineering",
      passoutYear: 2020,
      previousExp: "2 years maintenance engineering",
      paymentStatus: "PAID",
      paidAmount: 2568,
    },
  });

  console.log("  Student record created");

  // ---------------------------------------------------------------------------
  // 4. Phases for courses
  // ---------------------------------------------------------------------------

  // Professional Module phases (matching actual syllabus)
  const profPhases = [
    {
      number: 0,
      name: "Foundation (Pre-recorded)",
      description: "12+ hours of self-paced recorded sessions covering Basic Electrical, Basic Electronics, Introduction to Pneumatics, Introduction to Industrial Automation, and Introduction to PLC. Recommended to complete before live training.",
      durationDays: 0,
      order: 0,
    },
    {
      number: 1,
      name: "PLC Programming with Siemens TIA Portal",
      description: "Day 1: Introduction to Siemens TIA Portal, Overview of PLC, Understanding PLC Hardware and Architecture, Basics of Ladder Logic Programming, Hands-on Practice creating and editing PLC programs, Troubleshooting Techniques.",
      durationDays: 1,
      order: 1,
    },
    {
      number: 2,
      name: "Advanced PLC Programming & Applications",
      description: "Day 2: Advanced Programming Concepts in Siemens TIA Portal, Developing Complex PLC Programs, Simulation and Testing of PLC Programs, Practical Applications and Case Studies.",
      durationDays: 1,
      order: 2,
    },
    {
      number: 3,
      name: "HMI Development with Siemens TIA Portal",
      description: "Day 3: Introduction to HMI and its importance, Siemens HMI Hardware and Software overview, Creating HMI Projects, Designing HMI Screens and Navigation, Integrating HMI with PLC Programs, Best Practices.",
      durationDays: 1,
      order: 3,
    },
    {
      number: 4,
      name: "Introduction to SCADA (WinCC)",
      description: "Day 4: Overview of WinCC SCADA System, SCADA in Industrial Automation, Exploring WinCC Interface, Tags and Tag-based Data Acquisition, Creating Basic Graphics and Objects, Building a Simple SCADA Application.",
      durationDays: 1,
      order: 4,
    },
    {
      number: 5,
      name: "Advanced Features & Career Preparation",
      description: "Day 5: Dynamic Graphics and Animation, Alarm and Event Management, Trending and Historical Data Analysis, Introduction to Factory-IO, Project Creation, Interview Preparation, Resume Writing, Career Support.",
      durationDays: 1,
      order: 5,
    },
  ];

  for (const phase of profPhases) {
    await prisma.phase.upsert({
      where: { number_course: { number: phase.number, course: "PROFESSIONAL_MODULE" } },
      update: { name: phase.name, description: phase.description, durationDays: phase.durationDays, order: phase.order },
      create: { ...phase, course: "PROFESSIONAL_MODULE" },
    });
  }

  // AI Module phases
  const aiPhases = [
    {
      number: 0,
      name: "Foundation (Pre-recorded)",
      description: "12+ hours of self-paced recorded sessions covering Basic Electrical, Basic Electronics, Introduction to Pneumatics, Introduction to Industrial Automation, and Introduction to PLC. Recommended to complete before live training.",
      durationDays: 0,
      order: 0,
    },
    {
      number: 1,
      name: "AI Fundamentals for Industrial Automation",
      description: "Day 1: Introduction to AI and Machine Learning in Industry, Python fundamentals for automation engineers, Data collection and preprocessing from industrial systems, Hands-on setting up Python environment with industrial data.",
      durationDays: 1,
      order: 1,
    },
    {
      number: 2,
      name: "Machine Learning for Predictive Maintenance",
      description: "Day 2: Supervised and unsupervised learning concepts, Building predictive maintenance models, Anomaly detection in industrial processes, Hands-on training ML models with sensor data.",
      durationDays: 1,
      order: 2,
    },
    {
      number: 3,
      name: "Computer Vision for Quality Control",
      description: "Day 3: Image processing fundamentals, Object detection and classification, Quality inspection using AI vision systems, Hands-on building a vision-based quality control system.",
      durationDays: 1,
      order: 3,
    },
    {
      number: 4,
      name: "AI-Powered SCADA & Process Optimisation",
      description: "Day 4: AI integration with SCADA systems, Process optimisation using AI algorithms, Digital twin concepts, Hands-on building AI-enhanced monitoring dashboard.",
      durationDays: 1,
      order: 4,
    },
    {
      number: 5,
      name: "Career Preparation & Assessment",
      description: "Day 5: Comprehensive project combining PLC and AI, Technical interview preparation, Resume and CV writing for automation AI roles, Final assessment and CPD certificate award.",
      durationDays: 1,
      order: 5,
    },
  ];

  for (const phase of aiPhases) {
    await prisma.phase.upsert({
      where: { number_course: { number: phase.number, course: "AI_MODULE" } },
      update: { name: phase.name, description: phase.description, durationDays: phase.durationDays, order: phase.order },
      create: { ...phase, course: "AI_MODULE" },
    });
  }

  console.log("  Phases created for all courses");

  // ---------------------------------------------------------------------------
  // 5. Assessment Questions - Professional Module
  // ---------------------------------------------------------------------------
  const profQuestions = [
    { question: "What does PLC stand for?", optionA: "Programmable Logic Controller", optionB: "Power Line Communication", optionC: "Programmable Linear Circuit", optionD: "Process Logic Computer", correctAnswer: "A", order: 1 },
    { question: "Which programming language uses contacts and coils?", optionA: "Structured Text", optionB: "Function Block Diagram", optionC: "Ladder Logic", optionD: "Sequential Function Chart", correctAnswer: "C", order: 2 },
    { question: "What is the function of an HMI in an automation system?", optionA: "Control motor speed", optionB: "Provide operator interface for monitoring and control", optionC: "Measure temperature", optionD: "Convert analog to digital signals", correctAnswer: "B", order: 3 },
    { question: "What does SCADA stand for?", optionA: "System Control and Data Access", optionB: "Supervisory Control and Data Acquisition", optionC: "Sequential Control and Data Analysis", optionD: "Signal Control and Data Automation", correctAnswer: "B", order: 4 },
    { question: "Which Siemens PLC model is commonly used in the TIA Portal for training?", optionA: "S7-200", optionB: "S7-300", optionC: "S7-1200", optionD: "S7-400", correctAnswer: "C", order: 5 },
    { question: "What is a normally open (NO) contact in ladder logic?", optionA: "A contact that is always closed", optionB: "A contact that passes power when energised", optionC: "A contact that stops power flow", optionD: "A contact used only for outputs", correctAnswer: "B", order: 6 },
    { question: "What is the primary purpose of a timer in PLC programming?", optionA: "Count the number of items", optionB: "Delay the execution of an output", optionC: "Convert signals", optionD: "Monitor temperature", correctAnswer: "B", order: 7 },
    { question: "In WinCC SCADA, what are tags used for?", optionA: "Labelling physical wires", optionB: "Linking SCADA variables to PLC data points", optionC: "Creating user accounts", optionD: "Generating PDF reports", correctAnswer: "B", order: 8 },
    { question: "What is the purpose of FactoryIO in PLC training?", optionA: "Manufacturing real products", optionB: "Simulating industrial environments for testing PLC programs", optionC: "Writing PLC programs", optionD: "Designing electrical schematics", correctAnswer: "B", order: 9 },
    { question: "What does a counter instruction do in a PLC?", optionA: "Measures voltage", optionB: "Times how long a process takes", optionC: "Counts events or pulses", optionD: "Controls motor direction", correctAnswer: "C", order: 10 },
  ];

  for (const q of profQuestions) {
    await prisma.assessmentQuestion.create({
      data: {
        ...q,
        course: "PROFESSIONAL_MODULE",
      },
    });
  }

  console.log("  Professional Module assessment questions created");

  // ---------------------------------------------------------------------------
  // 6. Assessment Questions - AI Module
  // ---------------------------------------------------------------------------
  const aiQuestions = [
    { question: "What does AI stand for in industrial automation?", optionA: "Automated Integration", optionB: "Artificial Intelligence", optionC: "Analog Input", optionD: "Advanced Instrumentation", correctAnswer: "B", order: 1 },
    { question: "Which Python library is commonly used for machine learning?", optionA: "Django", optionB: "Flask", optionC: "scikit-learn", optionD: "Requests", correctAnswer: "C", order: 2 },
    { question: "What is predictive maintenance?", optionA: "Repairing equipment after it breaks", optionB: "Using data and ML to predict equipment failures before they occur", optionC: "Scheduling maintenance at fixed intervals", optionD: "Replacing all equipment annually", correctAnswer: "B", order: 3 },
    { question: "What type of learning uses labelled training data?", optionA: "Unsupervised learning", optionB: "Reinforcement learning", optionC: "Supervised learning", optionD: "Transfer learning", correctAnswer: "C", order: 4 },
    { question: "What is computer vision used for in quality control?", optionA: "Monitoring employee attendance", optionB: "Detecting defects and inspecting products automatically", optionC: "Calculating production costs", optionD: "Scheduling maintenance", correctAnswer: "B", order: 5 },
    { question: "What is a digital twin?", optionA: "A backup PLC program", optionB: "A virtual replica of a physical system for simulation and analysis", optionC: "Two identical sensors", optionD: "A redundant SCADA server", correctAnswer: "B", order: 6 },
    { question: "What is anomaly detection in industrial processes?", optionA: "Finding the most efficient process", optionB: "Identifying unusual patterns that deviate from expected behaviour", optionC: "Counting production output", optionD: "Measuring environmental impact", correctAnswer: "B", order: 7 },
    { question: "Which library is used for image processing in Python?", optionA: "NumPy", optionB: "Pandas", optionC: "OpenCV", optionD: "Matplotlib", correctAnswer: "C", order: 8 },
    { question: "What is the role of AI in SCADA systems?", optionA: "Replace the SCADA system entirely", optionB: "Enhance monitoring with predictive analytics and intelligent alarming", optionC: "Reduce the need for PLCs", optionD: "Eliminate the need for operators", correctAnswer: "B", order: 9 },
    { question: "What is feature engineering in machine learning?", optionA: "Building physical sensors", optionB: "Creating new input variables from raw data to improve model performance", optionC: "Designing PLC programs", optionD: "Installing software features", correctAnswer: "B", order: 10 },
  ];

  for (const q of aiQuestions) {
    await prisma.assessmentQuestion.create({
      data: {
        ...q,
        course: "AI_MODULE",
      },
    });
  }

  console.log("  AI Module assessment questions created");

  // ---------------------------------------------------------------------------
  // 7. Batches - Generate weekly batches for next 8 weeks
  // ---------------------------------------------------------------------------
  const courses = ["PROFESSIONAL_MODULE", "AI_MODULE"] as const;
  const coursePrefix: Record<string, string> = {
    PROFESSIONAL_MODULE: "UK-PROF",
    AI_MODULE: "UK-AI",
  };

  function getISOWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  let nextMonday = new Date();
  const day = nextMonday.getDay();
  const daysUntilMonday = day === 0 ? 1 : (8 - day);
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  let firstProfBatch: any = null;

  for (let w = 0; w < 8; w++) {
    const weekNum = getISOWeekNumber(nextMonday);
    const year = nextMonday.getFullYear();
    const friday = new Date(nextMonday);
    friday.setDate(friday.getDate() + 4);

    for (const course of courses) {
      const batchName = `${coursePrefix[course]}-W${String(weekNum).padStart(2, "0")}-${year}`;
      const batch = await prisma.batch.create({
        data: {
          name: batchName,
          course,
          startDate: new Date(nextMonday),
          endDate: new Date(friday),
          capacity: 6,
          status: "UPCOMING",
          instructorId: trainerEmployee.id,
          location: "Milton Keynes",
          isAutoGenerated: true,
        },
      });
      if (!firstProfBatch && course === "PROFESSIONAL_MODULE") {
        firstProfBatch = batch;
      }
    }

    nextMonday.setDate(nextMonday.getDate() + 7);
  }

  // Assign demo student to first professional batch
  if (firstProfBatch) {
    await prisma.student.update({
      where: { id: demoStudent.id },
      data: { batchId: firstProfBatch.id },
    });
  }

  console.log("  Batches created");

  // ---------------------------------------------------------------------------
  // 9. Sample leads
  // ---------------------------------------------------------------------------
  const leads = [
    {
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "+44 7700 900200",
      qualification: "BSc Computer Science",
      courseInterest: "PROFESSIONAL_MODULE" as const,
      source: "website",
      status: "NEW" as const,
    },
    {
      name: "Sarah Thompson",
      email: "sarah.t@example.com",
      phone: "+44 7700 900201",
      qualification: "HND Electrical Engineering",
      courseInterest: "PROFESSIONAL_MODULE" as const,
      source: "linkedin",
      status: "CONTACTED" as const,
      assignedToId: salesLeadEmployee.id,
      followUpDate: new Date("2026-04-01"),
    },
    {
      name: "Mohammed Khan",
      email: "m.khan@example.com",
      phone: "+44 7700 900202",
      qualification: "BEng Mechanical Engineering",
      courseInterest: "AI_MODULE" as const,
      source: "referral",
      status: "QUALIFIED" as const,
      assignedToId: adminEmployee.id,
      followUpDate: new Date("2026-03-28"),
    },
    {
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+44 7700 900203",
      courseInterest: "PROFESSIONAL_MODULE" as const,
      source: "google",
      status: "ENROLLED" as const,
      assignedToId: salesLeadEmployee.id,
    },
    {
      name: "David Brown",
      email: "d.brown@example.com",
      phone: "+44 7700 900204",
      qualification: "A-Levels",
      courseInterest: "AI_MODULE" as const,
      source: "facebook",
      status: "LOST" as const,
    },
  ];

  for (const leadData of leads) {
    const lead = await prisma.lead.create({ data: leadData });

    if (["CONTACTED", "QUALIFIED", "ENROLLED"].includes(leadData.status)) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: `Initial contact made. ${leadData.status === "QUALIFIED" ? "Candidate shows strong interest and meets prerequisites." : "Follow-up scheduled."}`,
          createdBy: "Staff Member",
        },
      });
    }
  }

  console.log("  Sample leads created");

  // ---------------------------------------------------------------------------
  // 10. Sample certificate for demo student
  // ---------------------------------------------------------------------------
  await prisma.certificate.create({
    data: {
      studentId: demoStudent.id,
      type: "COMPLETION",
      certificateNo: "EDW-UK-2026-00001",
      issuedDate: new Date("2026-03-15"),
      isValid: true,
      metadata: {
        course: "Professional Automation Engineering",
        grade: "Distinction",
        duration: "5 days + 12hrs recorded",
      },
    },
  });

  console.log("  Sample certificate created");

  // ---------------------------------------------------------------------------
  // 11. Sample sales targets and incentives
  // ---------------------------------------------------------------------------
  const now = new Date();
  await prisma.salesTarget.create({
    data: {
      employeeId: salesLeadEmployee.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      salesTarget: 15,
      leadTarget: 50,
      salesAchieved: 3,
      leadsGenerated: 22,
    },
  });

  await prisma.salesIncentive.create({
    data: {
      employeeId: salesLeadEmployee.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalSales: 3,
      mandatorySales: 5,
      incentivePerSale: 107,
      totalEarned: 0,
      distributed: 0,
    },
  });

  console.log("  Sample sales targets and incentives created");

  // ---------------------------------------------------------------------------
  // Done
  // ---------------------------------------------------------------------------
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

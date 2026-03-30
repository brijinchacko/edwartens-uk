const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== LMS Restructure Script ===');
  console.log('Started at:', new Date().toISOString());

  // ─── Step 1: Delete all existing sessions and progress ───
  console.log('\n--- Step 1: Deleting existing sessions & progress ---');
  const deletedProgress = await prisma.sessionProgress.deleteMany({});
  console.log(`Deleted ${deletedProgress.count} session progress records`);
  const deletedSessions = await prisma.session.deleteMany({});
  console.log(`Deleted ${deletedSessions.count} sessions`);

  // ─── Step 2: Get phase IDs ───
  console.log('\n--- Step 2: Fetching phases ---');
  const phases = await prisma.phase.findMany({
    where: { course: 'PROFESSIONAL_MODULE' },
    orderBy: { number: 'asc' },
  });

  const phaseMap = {};
  for (const p of phases) {
    phaseMap[p.number] = p.id;
    console.log(`Phase ${p.number}: ${p.name} (${p.id})`);
  }

  if (Object.keys(phaseMap).length < 6) {
    throw new Error(`Expected 6 phases (0-5), found ${Object.keys(phaseMap).length}`);
  }

  // ─── Step 3: Create sessions in exact syllabus order ───
  console.log('\n--- Step 3: Creating sessions ---');

  // Helper: build a session object
  function s(title, description, videoUrl, videoPlatform, videoId, order, phaseNum, isMandatory) {
    return {
      title,
      description: description || title,
      phaseId: phaseMap[phaseNum],
      videoUrl: videoUrl || null,
      videoPlatform: videoPlatform || null,
      videoId: videoId || null,
      order,
      isMandatory: isMandatory !== undefined ? isMandatory : (videoUrl ? true : false),
    };
  }

  const allSessions = [
    // ═══ Phase 0: Foundation (Pre-recorded) ═══
    s('TIA Portal V19 and PLCSIM Installation Guide',
      'Step-by-step guide to installing TIA Portal V19 and PLCSIM for Siemens PLC programming.',
      null, null, null, 1, 0, false),

    s('Introduction to Industrial Automation',
      'Overview of industrial automation, its history, components, and applications in modern manufacturing.',
      'https://vimeo.com/964342820', 'vimeo', '964342820', 2, 0, true),

    s('Introduction to PLC',
      'Fundamentals of Programmable Logic Controllers - architecture, working principle, and applications.',
      'https://vimeo.com/965354223', 'vimeo', '965354223', 3, 0, true),

    s('Basic Electronics And Electricals',
      'Core concepts of electronics and electrical engineering relevant to industrial automation.',
      'https://vimeo.com/964343497', 'vimeo', '964343497', 4, 0, true),

    s('Getting Started with FactoryIO',
      'Learn how to set up and use FactoryIO simulation software for PLC programming practice.',
      null, null, null, 5, 0, false),

    s('Software Download - FactoryIO',
      'Download links and installation instructions for FactoryIO simulation software.',
      null, null, null, 6, 0, false),

    // ═══ Phase 1: Electrical Engineering (order 1-12) ═══
    s('Basic Electrical Concepts (Current, Voltage, Resistance, Ohm\'s Law)',
      'Understanding fundamental electrical concepts including current flow, voltage, resistance, and Ohm\'s Law with practical examples.',
      'https://www.youtube.com/watch?v=kcL2_D33k3o', 'youtube', 'kcL2_D33k3o', 1, 1, true),

    s('Power Systems (Single Phase, Three Phase, Transformers)',
      'Comprehensive study of single-phase and three-phase power systems, transformer principles, and power distribution.',
      'https://www.youtube.com/watch?v=u0SsejDCVkU', 'youtube', 'u0SsejDCVkU', 2, 1, true),

    s('Electrical Drawings & Schematics (Wiring Diagrams, Panel Layouts)',
      'Reading and interpreting electrical drawings, wiring diagrams, and control panel layouts.',
      'https://www.youtube.com/watch?v=c8bD59Q2Rv8', 'youtube', 'c8bD59Q2Rv8', 3, 1, true),

    s('Lockout-Tagout (LOTO) Safety Procedures',
      'Essential LOTO safety procedures for electrical isolation, ensuring worker safety during maintenance.',
      'https://www.youtube.com/watch?v=Np14M0du758', 'youtube', 'Np14M0du758', 4, 1, true),

    s('Motors (Induction, Servo, VFD/VSD, Synchronous)',
      'Types of industrial motors including induction, servo, synchronous motors and variable frequency drives.',
      'https://www.youtube.com/watch?v=g7jFGOn6xfU', 'youtube', 'g7jFGOn6xfU', 5, 1, true),

    s('Motor Starters (DOL, Star-Delta, Soft Starters)',
      'Motor starting methods including Direct Online, Star-Delta, and Soft Starters with selection criteria.',
      'https://www.youtube.com/watch?v=LvYZ7_wp8Tk', 'youtube', 'LvYZ7_wp8Tk', 6, 1, true),

    s('Power Distribution (LV, MV, HV Systems)',
      'Low, medium, and high voltage power distribution systems in industrial facilities.',
      'https://www.youtube.com/watch?v=A54K8o2CZyo', 'youtube', 'A54K8o2CZyo', 7, 1, true),

    s('Electrical Fault Finding & Troubleshooting',
      'Systematic approach to diagnosing and resolving electrical faults in industrial systems.',
      'https://www.youtube.com/watch?v=xxclrVcvKSQ', 'youtube', 'xxclrVcvKSQ', 8, 1, true),

    s('Earthing, Grounding & Bonding',
      'Principles and practices of earthing, grounding, and bonding for electrical safety.',
      'https://www.youtube.com/watch?v=GnoDW4YtVY8', 'youtube', 'GnoDW4YtVY8', 9, 1, true),

    s('Circuit Breakers, Fuses, Relays & Contactors',
      'Understanding protective devices - circuit breakers, fuses, relays, and contactors in industrial circuits.',
      'https://www.youtube.com/watch?v=VGj32euYZ2c', 'youtube', 'VGj32euYZ2c', 10, 1, true),

    s('Electrical Protection Systems (Overcurrent, Short Circuit, Earth Fault)',
      'Design and application of electrical protection systems including overcurrent, short circuit, and earth fault protection.',
      'https://www.youtube.com/watch?v=NCqh_D3B0ao', 'youtube', 'NCqh_D3B0ao', 11, 1, true),

    s('Busbar Systems and Power Factor Correction',
      'Busbar trunking systems and power factor correction techniques for industrial installations.',
      'https://www.youtube.com/watch?v=eBogODs99J8', 'youtube', 'eBogODs99J8', 12, 1, true),

    // ═══ Phase 1 continued: Mechanical Engineering (order 13-20) ═══
    s('Fundamentals of Mechanics (Forces, Torque, Friction, Stress & Strain)',
      'Core mechanical engineering concepts including forces, torque, friction, stress and strain analysis.',
      'https://www.youtube.com/watch?v=aQf6Q8t1FQE', 'youtube', 'aQf6Q8t1FQE', 13, 1, true),

    s('Gearboxes & Couplings',
      'Types of gearboxes and couplings used in industrial machinery, selection and maintenance.',
      'https://www.youtube.com/watch?v=vHbQWFi7S9Y', 'youtube', 'vHbQWFi7S9Y', 14, 1, true),

    s('Bearings (Types, Lubrication, Installation)',
      'Bearing types, lubrication methods, proper installation techniques, and failure analysis.',
      'https://www.youtube.com/watch?v=EJPQqB1NLUs', 'youtube', 'EJPQqB1NLUs', 15, 1, true),

    s('Belt & Chain Drives',
      'Belt drives and chain drives - types, tensioning, alignment, and maintenance procedures.',
      'https://www.youtube.com/watch?v=E6gWM8a082w', 'youtube', 'E6gWM8a082w', 16, 1, true),

    s('Conveyor Systems (Types, Maintenance, Troubleshooting)',
      'Industrial conveyor systems - belt, roller, chain conveyors with maintenance and troubleshooting.',
      'https://www.youtube.com/watch?v=qcUmM_W6GfQ', 'youtube', 'qcUmM_W6GfQ', 17, 1, true),

    s('Pumps & Compressors (Centrifugal, Positive Displacement)',
      'Centrifugal and positive displacement pumps and compressors - working principles and applications.',
      'https://www.youtube.com/watch?v=BaEHVpKc-1Q', 'youtube', 'BaEHVpKc-1Q', 18, 1, true),

    s('Machine Alignment & Balancing',
      'Precision alignment and balancing techniques for rotating machinery.',
      null, null, null, 19, 1, false),

    s('Thermal Expansion & Material Selection',
      'Understanding thermal expansion effects and material selection for industrial applications.',
      null, null, null, 20, 1, false),

    // ═══ Phase 2: Instrumentation & Sensors (order 1-9) ═══
    s('Proximity Sensors (Inductive, Capacitive, Optical)',
      'Working principles and applications of inductive, capacitive, and optical proximity sensors.',
      'https://www.youtube.com/watch?v=RO1P8jGYU78', 'youtube', 'RO1P8jGYU78', 1, 2, true),

    s('Temperature Sensors (RTD, Thermocouples, Infrared)',
      'Temperature measurement using RTDs, thermocouples, and infrared sensors with calibration.',
      'https://www.youtube.com/watch?v=v7NUi88Lxi8', 'youtube', 'v7NUi88Lxi8', 2, 2, true),

    s('Pressure Sensors (Strain Gauge, Bourdon Tube, Piezoelectric)',
      'Pressure measurement technologies including strain gauge, Bourdon tube, and piezoelectric sensors.',
      'https://www.youtube.com/watch?v=uXX8Sveopy8', 'youtube', 'uXX8Sveopy8', 3, 2, true),

    s('Flow Sensors (Electromagnetic, Ultrasonic, Vortex, Turbine)',
      'Flow measurement using electromagnetic, ultrasonic, vortex, and turbine flow sensors.',
      'https://www.youtube.com/watch?v=XoVW7CRR5JY', 'youtube', 'XoVW7CRR5JY', 4, 2, true),

    s('Level Sensors (Ultrasonic, Float, Radar)',
      'Level measurement technologies - ultrasonic, float, and radar level sensors.',
      'https://www.youtube.com/watch?v=CYL1yNWJNQ4', 'youtube', 'CYL1yNWJNQ4', 5, 2, true),

    s('Load Cells & Strain Gauges',
      'Principles of load cells and strain gauges for force and weight measurement.',
      null, null, null, 6, 2, false),

    s('Transmitters, Signal Conditioning & Calibration',
      'Signal transmitters, conditioning circuits, and calibration procedures for industrial instruments.',
      null, null, null, 7, 2, false),

    s('Process Control Loops (PID Controllers)',
      'Understanding PID control loops - proportional, integral, and derivative control in process industries.',
      'https://www.youtube.com/watch?v=IB1Ir4oCP5k', 'youtube', 'IB1Ir4oCP5k', 8, 2, true),

    s('HART, 4-20mA, 0-10V Analog Signals',
      'Industrial analog signal standards - HART protocol, 4-20mA current loops, and 0-10V voltage signals.',
      'https://www.youtube.com/watch?v=PSXCUB3yEHE', 'youtube', 'PSXCUB3yEHE', 9, 2, true),

    // ═══ Phase 2 continued: Pneumatics & Hydraulics (order 10-16) ═══
    s('Types of Pneumatic Valves (Directional, Flow, Pressure Control)',
      'Pneumatic valve types - directional control, flow control, and pressure control valves.',
      'https://www.youtube.com/watch?v=bXXL-0sf8gs', 'youtube', 'bXXL-0sf8gs', 10, 2, true),

    s('Pneumatic Cylinders & Actuators',
      'Single-acting and double-acting pneumatic cylinders and rotary actuators.',
      null, null, null, 11, 2, false),

    s('Air Compressors & Dryers',
      'Types of air compressors, air treatment, and dryer systems for pneumatic applications.',
      null, null, null, 12, 2, false),

    s('Hydraulic Valves & Pumps',
      'Hydraulic system components - directional valves, pressure valves, and hydraulic pumps.',
      null, null, null, 13, 2, false),

    s('Hydraulic Actuators (Linear & Rotary)',
      'Hydraulic cylinders and rotary actuators - types, sizing, and applications.',
      null, null, null, 14, 2, false),

    s('Hydraulic Oil Selection & Filtration',
      'Selecting hydraulic fluids and filtration systems for optimal system performance.',
      null, null, null, 15, 2, false),

    s('Troubleshooting Pneumatic/Hydraulic Systems',
      'Systematic troubleshooting techniques for pneumatic and hydraulic systems.',
      'https://www.youtube.com/watch?v=Av5ZbahEBRk', 'youtube', 'Av5ZbahEBRk', 16, 2, true),

    // ═══ Phase 3: Control Systems & Automation (order 1-10) ═══
    s('PLC Programming (Siemens, Allen Bradley, Schneider, Omron, Mitsubishi)',
      'Overview of PLC programming across major brands - Siemens, Allen Bradley, Schneider, Omron, and Mitsubishi.',
      'https://www.youtube.com/watch?v=B65detMhnoc', 'youtube', 'B65detMhnoc', 1, 3, true),

    s('SCADA (Supervisory Control and Data Acquisition)',
      'SCADA systems - architecture, components, communication protocols, and applications.',
      'https://www.youtube.com/watch?v=nlFM1q9QPJw', 'youtube', 'nlFM1q9QPJw', 2, 3, true),

    s('HMI (Human Machine Interface) Programming',
      'Designing and programming HMI screens for operator interfaces in industrial systems.',
      null, null, null, 3, 3, false),

    s('DCS (Distributed Control System)',
      'Distributed Control Systems - architecture, configuration, and comparison with PLC/SCADA.',
      'https://www.youtube.com/watch?v=B3YVpgs9RY4', 'youtube', 'B3YVpgs9RY4', 4, 3, true),

    s('Ladder Logic, Functional Block Diagram, Structured Text',
      'IEC 61131-3 programming languages - Ladder Logic, FBD, and Structured Text.',
      'https://www.youtube.com/watch?v=HExlaNITqNY', 'youtube', 'HExlaNITqNY', 5, 3, true),

    s('Troubleshooting PLC & SCADA Systems',
      'Fault diagnosis and troubleshooting methodologies for PLC and SCADA systems.',
      'https://www.youtube.com/watch?v=bFvgWXkbMU0', 'youtube', 'bFvgWXkbMU0', 6, 3, true),

    s('PID Tuning & Control Loop Optimization',
      'PID controller tuning methods - Ziegler-Nichols, Cohen-Coon, and auto-tuning techniques.',
      'https://www.youtube.com/watch?v=fv6dLTEvl74', 'youtube', 'fv6dLTEvl74', 7, 3, true),

    s('Motion Control (Servo, Stepper Motors)',
      'Motion control systems using servo motors and stepper motors with positioning.',
      null, null, null, 8, 3, false),

    s('Panel Wiring & Integration of Control Panels',
      'Control panel design, wiring standards, and integration of PLCs, drives, and protection devices.',
      'https://www.youtube.com/watch?v=twBJpeJh_Cc', 'youtube', 'twBJpeJh_Cc', 9, 3, true),

    s('Interfacing PLC with Sensors, Actuators, VFDs',
      'Connecting and configuring PLCs with field devices - sensors, actuators, and variable frequency drives.',
      'https://www.youtube.com/watch?v=Iw-zJ-MpAR8', 'youtube', 'Iw-zJ-MpAR8', 10, 3, true),

    // ═══ Phase 3 continued: Robotics & Industrial Automation (order 11-16) ═══
    s('Industrial Robots (ABB, KUKA, Fanuc, Yaskawa, Kawasaki, Epson)',
      'Overview of major industrial robot manufacturers and their robot types and applications.',
      'https://www.youtube.com/watch?v=KST6zHXqzTs', 'youtube', 'KST6zHXqzTs', 11, 3, true),

    s('Robot Programming (KRL, RAPID, VAL3, AS Language)',
      'Robot programming languages - KUKA KRL, ABB RAPID, Staubli VAL3, and Kawasaki AS.',
      'https://www.youtube.com/watch?v=b5eQaAl0txY', 'youtube', 'b5eQaAl0txY', 12, 3, true),

    s('Robot-PLC Communication (Fieldbus, Digital IO, Ethernet)',
      'Integrating robots with PLCs using fieldbus protocols, digital I/O, and industrial Ethernet.',
      null, null, null, 13, 3, false),

    s('End Effectors & Tool Changers',
      'Robot end effectors - grippers, welding torches, tool changers, and custom tooling.',
      null, null, null, 14, 3, false),

    s('Vision Systems & AI Integration in Robotics',
      'Machine vision systems and artificial intelligence applications in industrial robotics.',
      null, null, null, 15, 3, false),

    s('Robot Calibration & Path Optimization',
      'Robot calibration procedures and path planning optimization techniques.',
      null, null, null, 16, 3, false),

    // ═══ Phase 4: Industrial Communication Protocols (order 1-5) ═══
    s('Ethernet/IP, Modbus TCP, Profibus, Profinet',
      'Major industrial communication protocols - Ethernet/IP, Modbus TCP, Profibus, and Profinet.',
      'https://www.youtube.com/watch?v=HLziLmaYsO0', 'youtube', 'HLziLmaYsO0', 1, 4, true),

    s('DeviceNet, CANopen, CC-Link, EtherCAT',
      'Fieldbus protocols - DeviceNet, CANopen, CC-Link, and EtherCAT for industrial automation.',
      'https://www.youtube.com/watch?v=DlbkWryzJqg', 'youtube', 'DlbkWryzJqg', 2, 4, true),

    s('OPC-UA, MQTT (IoT Communication)',
      'Modern industrial IoT communication - OPC-UA and MQTT protocols for Industry 4.0.',
      'https://www.youtube.com/watch?v=D3JnN1GBnGc', 'youtube', 'D3JnN1GBnGc', 3, 4, true),

    s('Serial Communication (RS232, RS485, RS422)',
      'Serial communication standards - RS232, RS485, and RS422 in industrial applications.',
      'https://www.youtube.com/watch?v=3wgKcUDlHuM', 'youtube', '3wgKcUDlHuM', 4, 4, true),

    s('Wireless Industrial Communication (Wi-Fi, Zigbee, Bluetooth)',
      'Wireless technologies in industrial settings - Wi-Fi, Zigbee, and Bluetooth applications.',
      'https://www.youtube.com/watch?v=pFDkibWy0yg', 'youtube', 'pFDkibWy0yg', 5, 4, true),

    // ═══ Phase 5: Maintenance & Reliability (order 1-5) ═══
    s('Predictive Maintenance (Vibration Analysis, Thermography, Oil Analysis)',
      'Predictive maintenance techniques - vibration analysis, thermography, and oil analysis.',
      'https://www.youtube.com/watch?v=k6eJqLGRGAQ', 'youtube', 'k6eJqLGRGAQ', 1, 5, true),

    s('Preventive Maintenance Strategies (CMMS, TPM, RCM)',
      'Preventive maintenance strategies - CMMS, Total Productive Maintenance, and Reliability Centered Maintenance.',
      null, null, null, 2, 5, false),

    s('Breakdown Analysis (Root Cause Analysis - RCA, 5 Why, Fishbone Diagram)',
      'Root cause analysis methodologies - RCA, 5 Why analysis, and Ishikawa fishbone diagrams.',
      'https://www.youtube.com/watch?v=-_nN_YTDsuk', 'youtube', '-_nN_YTDsuk', 3, 5, true),

    s('Condition Monitoring (Ultrasound, Motor Current Signature Analysis)',
      'Condition monitoring techniques - ultrasound testing and motor current signature analysis.',
      'https://www.youtube.com/watch?v=RNuPM5SGYuk', 'youtube', 'RNuPM5SGYuk', 4, 5, true),

    s('Energy Management & Optimization',
      'Industrial energy management, auditing, and optimization strategies.',
      null, null, null, 5, 5, false),

    // ═══ Phase 5 continued: Safety & Standards (order 6-14) ═══
    s('Electrical Safety (NFPA 70E, IEC 60204)',
      'Electrical safety standards - NFPA 70E and IEC 60204 for industrial electrical systems.',
      'https://www.youtube.com/watch?v=K6iJN6kN-Is', 'youtube', 'K6iJN6kN-Is', 6, 5, true),

    s('Machine Safety (Emergency Stops, Interlocks, Safety PLCs)',
      'Machine safety systems - emergency stops, safety interlocks, and safety PLCs.',
      'https://www.youtube.com/watch?v=fS0DBC4TRy8', 'youtube', 'fS0DBC4TRy8', 7, 5, true),

    s('Industrial Safety (LOTO, PPE, Fire Safety)',
      'Industrial safety practices - Lockout/Tagout, personal protective equipment, and fire safety.',
      'https://www.youtube.com/watch?v=sZikFEbycFg', 'youtube', 'sZikFEbycFg', 8, 5, true),

    s('ISO & IEC Industrial Standards (ISO 13849, IEC 61508 - SIL)',
      'Key industrial safety standards - ISO 13849 performance levels and IEC 61508 SIL ratings.',
      'https://www.youtube.com/watch?v=SPwk0NpUyx8', 'youtube', 'SPwk0NpUyx8', 9, 5, true),

    s('Hazardous Area Classification (ATEX, NEC, Intrinsically Safe Systems)',
      'Hazardous area classification - ATEX directives, NEC codes, and intrinsically safe systems.',
      'https://www.youtube.com/watch?v=2zQvaMCfqq8', 'youtube', '2zQvaMCfqq8', 10, 5, true),

    s('Live Class - Siemens PLC',
      'Live interactive class on Siemens PLC programming with TIA Portal.',
      null, null, null, 11, 5, false),

    s('Live Class - Siemens HMI',
      'Live interactive class on Siemens HMI design and configuration.',
      null, null, null, 12, 5, false),

    s('Live Class - Siemens SCADA',
      'Live interactive class on Siemens WinCC SCADA system configuration.',
      null, null, null, 13, 5, false),

    s('Career Consultation - One to One Session',
      'Personalised one-to-one career consultation session with industry experts.',
      null, null, null, 14, 5, false),
  ];

  let created = 0;
  for (const sess of allSessions) {
    await prisma.session.create({ data: sess });
    created++;
  }
  console.log(`Created ${created} sessions`);

  // ─── Step 4: Create section assessment questions ───
  console.log('\n--- Step 4: Creating section assessment questions ---');

  // Find the current max order for existing questions
  const maxOrderResult = await prisma.assessmentQuestion.aggregate({
    _max: { order: true },
    where: { course: 'PROFESSIONAL_MODULE', category: 'THEORY' },
  });
  let orderCounter = (maxOrderResult._max.order || 0) + 1;

  function q(question, optionA, optionB, optionC, optionD, correctAnswer, explanation) {
    const record = {
      course: 'PROFESSIONAL_MODULE',
      category: 'THEORY',
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation: explanation || '',
      order: orderCounter++,
      isActive: true,
    };
    return record;
  }

  const questions = [
    // ══════ Section 1: Electrical Engineering ══════
    q(
      'According to Ohm\'s Law, if a circuit has a resistance of 10 ohms and a voltage of 50V, what is the current?',
      '5A', '500A', '0.2A', '50A', 'A',
      'Ohm\'s Law: I = V/R = 50/10 = 5A'
    ),
    q(
      'In a three-phase power system, what is the phase angle between consecutive phases?',
      '90 degrees', '120 degrees', '180 degrees', '60 degrees', 'B',
      'Three-phase systems have 120 degrees separation between each phase.'
    ),
    q(
      'What is the primary purpose of a Lockout-Tagout (LOTO) procedure?',
      'To increase machine speed', 'To prevent accidental energisation during maintenance', 'To calibrate instruments', 'To test circuit breakers', 'B',
      'LOTO ensures machines are properly shut off and cannot be started during maintenance to protect workers.'
    ),
    q(
      'Which motor type is most commonly used in industrial Variable Frequency Drive (VFD) applications?',
      'DC Shunt Motor', 'Synchronous Motor', 'Three-phase Induction Motor', 'Universal Motor', 'C',
      'Three-phase induction motors are the most commonly paired with VFDs due to their rugged construction and simplicity.'
    ),
    q(
      'What is the function of a contactor in an electrical circuit?',
      'Measures voltage', 'Switches high-current loads remotely', 'Converts AC to DC', 'Provides overcurrent protection', 'B',
      'A contactor is an electrically controlled switch used for switching high-current loads, typically motors.'
    ),

    // ══════ Section 2: Mechanical Engineering ══════
    q(
      'Which type of bearing is best suited for handling combined radial and axial loads?',
      'Deep groove ball bearing', 'Tapered roller bearing', 'Needle roller bearing', 'Thrust ball bearing', 'B',
      'Tapered roller bearings are designed to handle combined radial and axial loads effectively.'
    ),
    q(
      'What is the primary advantage of a helical gear over a spur gear?',
      'Lower cost', 'Smoother and quieter operation', 'Simpler manufacturing', 'No axial thrust', 'B',
      'Helical gears mesh gradually, resulting in smoother and quieter operation compared to spur gears.'
    ),
    q(
      'In a belt drive system, what causes belt slippage?',
      'Excessive tension', 'Insufficient tension or overload', 'Belt being too short', 'Pulley diameter too large', 'B',
      'Belt slippage occurs due to insufficient tension or when the driven load exceeds the friction force capacity.'
    ),
    q(
      'Which type of pump creates flow by trapping fluid between gears?',
      'Centrifugal pump', 'Gear pump (positive displacement)', 'Axial flow pump', 'Submersible pump', 'B',
      'Gear pumps are positive displacement pumps that use meshing gears to pump fluid by trapping it between teeth.'
    ),
    q(
      'What is the main purpose of laser alignment on rotating machinery?',
      'To measure temperature', 'To ensure shafts are collinear to reduce vibration and wear', 'To balance the rotor', 'To check oil levels', 'B',
      'Laser shaft alignment ensures proper collinear alignment, reducing vibration, bearing wear, and energy consumption.'
    ),

    // ══════ Section 3: Instrumentation & Sensors ══════
    q(
      'Which type of proximity sensor can detect both metallic and non-metallic objects?',
      'Inductive sensor', 'Capacitive sensor', 'Magnetic sensor', 'Hall effect sensor', 'B',
      'Capacitive proximity sensors can detect both metallic and non-metallic objects by sensing changes in capacitance.'
    ),
    q(
      'What does RTD stand for in temperature measurement?',
      'Rapid Temperature Detector', 'Resistance Temperature Detector', 'Radiant Thermal Device', 'Real Time Diagnostics', 'B',
      'RTD stands for Resistance Temperature Detector - it measures temperature based on the change in electrical resistance of a metal element.'
    ),
    q(
      'In a 4-20mA current loop, what does a signal of 4mA typically represent?',
      'Maximum process value', 'Sensor fault', 'Minimum (zero) process value', 'Midrange value', 'C',
      '4mA represents the zero/minimum process value. Using 4mA (not 0mA) as the low end allows detection of wire breaks (0mA = fault).'
    ),
    q(
      'Which flow sensor type works on Faraday\'s law of electromagnetic induction?',
      'Vortex flow meter', 'Electromagnetic flow meter', 'Turbine flow meter', 'Ultrasonic flow meter', 'B',
      'Electromagnetic flow meters use Faraday\'s law - a conductive fluid moving through a magnetic field induces a voltage proportional to flow velocity.'
    ),
    q(
      'What are the three components of a PID controller?',
      'Power, Input, Data', 'Proportional, Integral, Derivative', 'Pressure, Indication, Display', 'Program, Interface, Driver', 'B',
      'PID stands for Proportional, Integral, Derivative - the three control actions used to minimise error in a control loop.'
    ),

    // ══════ Section 4: Pneumatics & Hydraulics ══════
    q(
      'What is the standard operating pressure range for most industrial pneumatic systems?',
      '1-2 bar', '6-8 bar', '50-100 bar', '200-300 bar', 'B',
      'Most industrial pneumatic systems operate at 6-8 bar (approximately 90-120 psi).'
    ),
    q(
      'A 5/2 directional control valve has how many ports and how many positions?',
      '5 ports, 2 positions', '2 ports, 5 positions', '5 ports, 3 positions', '3 ports, 2 positions', 'A',
      'A 5/2 valve has 5 ports (connections) and 2 switching positions, commonly used for double-acting cylinders.'
    ),
    q(
      'What is the main advantage of hydraulic systems over pneumatic systems?',
      'Lower cost', 'Higher force capability and precise control', 'Cleaner operation', 'Faster response', 'B',
      'Hydraulic systems can generate much higher forces than pneumatics due to the incompressibility of hydraulic oil, with more precise control.'
    ),
    q(
      'What causes cavitation in a hydraulic pump?',
      'Excessive oil pressure', 'Air bubbles forming due to low pressure at the pump inlet', 'High oil temperature only', 'Using the wrong type of filter', 'B',
      'Cavitation occurs when pressure at the pump inlet drops below the vapour pressure of the hydraulic fluid, forming air bubbles that collapse and damage components.'
    ),
    q(
      'In pneumatic troubleshooting, a cylinder moving slowly is most likely caused by:',
      'Excessive supply pressure', 'Restricted airflow or undersized tubing', 'Valve stuck open', 'New seals installed', 'B',
      'Slow cylinder movement is typically caused by restricted airflow due to kinked tubing, clogged filters, or undersized flow control valves.'
    ),

    // ══════ Section 5: Control Systems ══════
    q(
      'What does PLC stand for?',
      'Power Line Controller', 'Programmable Logic Controller', 'Process Level Computer', 'Primary Logic Circuit', 'B',
      'PLC stands for Programmable Logic Controller - a digital computer used for automation of industrial processes.'
    ),
    q(
      'In Ladder Logic programming, what does a normally open (NO) contact represent?',
      'A contact that is always closed', 'A condition that must be TRUE for current to flow', 'An output coil', 'A timer instruction', 'B',
      'A normally open contact in Ladder Logic passes power (is TRUE) when its associated input is energised/active.'
    ),
    q(
      'What is the main difference between SCADA and DCS?',
      'SCADA is only for small systems', 'SCADA covers geographically distributed systems while DCS is for centralised process control', 'DCS cannot handle analog signals', 'There is no difference', 'B',
      'SCADA is designed for geographically distributed systems (pipelines, power grids) while DCS is optimised for centralised, continuous process control (refineries, chemical plants).'
    ),
    q(
      'Which IEC 61131-3 programming language uses graphical function blocks connected by lines?',
      'Structured Text (ST)', 'Instruction List (IL)', 'Function Block Diagram (FBD)', 'Sequential Function Chart (SFC)', 'C',
      'Function Block Diagram (FBD) uses graphical blocks connected by signal flow lines to represent control logic.'
    ),
    q(
      'What is the purpose of an HMI in an industrial automation system?',
      'To replace the PLC', 'To provide a graphical interface for operators to monitor and control processes', 'To store historical data only', 'To convert analog signals', 'B',
      'HMI (Human Machine Interface) provides operators with a graphical display to monitor process variables and control equipment.'
    ),

    // ══════ Section 6: Robotics ══════
    q(
      'Which industrial robot manufacturer uses the RAPID programming language?',
      'KUKA', 'ABB', 'Fanuc', 'Yaskawa', 'B',
      'ABB robots use the RAPID programming language for robot motion and logic control.'
    ),
    q(
      'What is an end effector in robotics?',
      'The robot controller', 'The device attached to the robot arm for task execution (gripper, welder, etc.)', 'The power supply unit', 'The base mounting plate', 'B',
      'An end effector is the tool attached to the end of a robot arm that interacts with the workpiece - such as grippers, welding torches, or spray guns.'
    ),
    q(
      'Which type of industrial robot configuration has three linear axes (X, Y, Z)?',
      'Articulated robot', 'Cartesian/Gantry robot', 'SCARA robot', 'Delta robot', 'B',
      'Cartesian (Gantry) robots use three linear axes (X, Y, Z) for positioning, providing a rectangular work envelope.'
    ),
    q(
      'What communication method is commonly used for Robot-PLC integration in modern systems?',
      'USB connection', 'Industrial Ethernet (e.g., PROFINET, EtherNet/IP)', 'Bluetooth', 'Infrared', 'B',
      'Industrial Ethernet protocols like PROFINET and EtherNet/IP are the standard for modern robot-PLC communication due to speed and reliability.'
    ),
    q(
      'How many axes of movement does a typical articulated industrial robot have?',
      '3 axes', '4 axes', '6 axes', '8 axes', 'C',
      'A typical articulated industrial robot has 6 axes (degrees of freedom), providing full flexibility for positioning and orientation.'
    ),

    // ══════ Section 7: Communication Protocols ══════
    q(
      'Which industrial protocol was developed by Siemens and is widely used in European automation?',
      'DeviceNet', 'PROFINET', 'EtherNet/IP', 'CC-Link', 'B',
      'PROFINET was developed by Siemens/PROFIBUS International and is widely adopted in European industrial automation.'
    ),
    q(
      'What does OPC-UA stand for?',
      'Open Platform Communications Unified Architecture', 'Optical Protocol Connection Universal Access', 'Operating Procedure Control Unit Application', 'Output Process Controller Universal Adapter', 'A',
      'OPC-UA stands for Open Platform Communications Unified Architecture - a platform-independent, service-oriented protocol for industrial data exchange.'
    ),
    q(
      'In Modbus communication, what is the maximum number of holding registers that can be read in a single request?',
      '10', '125', '256', '1000', 'B',
      'Modbus allows reading up to 125 holding registers (16-bit) in a single request (Function Code 03).'
    ),
    q(
      'Which serial communication standard supports multi-drop (multiple devices on one bus) with distances up to 1200m?',
      'RS-232', 'RS-485', 'USB', 'SPI', 'B',
      'RS-485 supports multi-point communication (up to 32 devices) with cable lengths up to 1200 metres.'
    ),
    q(
      'What is MQTT primarily designed for?',
      'High-speed servo control', 'Lightweight publish-subscribe messaging for IoT devices', 'Video streaming', 'Database management', 'B',
      'MQTT (Message Queuing Telemetry Transport) is a lightweight publish-subscribe messaging protocol designed for IoT and M2M communication.'
    ),

    // ══════ Section 8: Maintenance ══════
    q(
      'What type of maintenance uses vibration analysis and thermography to predict failures before they occur?',
      'Reactive maintenance', 'Preventive maintenance', 'Predictive maintenance', 'Corrective maintenance', 'C',
      'Predictive maintenance uses condition monitoring tools like vibration analysis and thermography to detect early signs of failure.'
    ),
    q(
      'What does CMMS stand for?',
      'Central Machine Monitoring System', 'Computerised Maintenance Management System', 'Certified Mechanical Maintenance Standard', 'Continuous Machine Monitoring Service', 'B',
      'CMMS stands for Computerised Maintenance Management System - software for scheduling, tracking, and managing maintenance activities.'
    ),
    q(
      'In Root Cause Analysis, the "5 Why" technique involves:',
      'Asking five different experts', 'Repeatedly asking "why" to drill down to the root cause', 'Checking five different machines', 'Running five diagnostic tests', 'B',
      'The 5 Why technique involves repeatedly asking "why" (typically five times) to peel back layers of symptoms and reach the fundamental root cause.'
    ),
    q(
      'Which condition monitoring technique uses infrared cameras to detect hot spots?',
      'Vibration analysis', 'Ultrasonic testing', 'Thermography', 'Oil analysis', 'C',
      'Thermography (infrared imaging) uses thermal cameras to detect abnormal heat patterns indicating electrical faults, bearing failures, or insulation problems.'
    ),
    q(
      'What does TPM stand for in maintenance strategy?',
      'Total Process Management', 'Total Productive Maintenance', 'Technical Preventive Methods', 'Timed Predictive Monitoring', 'B',
      'TPM stands for Total Productive Maintenance - a holistic approach involving all employees in maintaining and improving equipment effectiveness.'
    ),

    // ══════ Section 9: Safety Standards ══════
    q(
      'What does SIL stand for in functional safety?',
      'Standard Industrial Level', 'Safety Integrity Level', 'System Integration Layer', 'Safety Inspection Log', 'B',
      'SIL stands for Safety Integrity Level - defined in IEC 61508, it classifies the reliability of safety functions from SIL 1 (lowest) to SIL 4 (highest).'
    ),
    q(
      'What does the ATEX directive regulate?',
      'Electrical wiring standards', 'Equipment and protective systems for use in potentially explosive atmospheres', 'Environmental emissions', 'Machine guarding requirements', 'B',
      'ATEX (from French: ATmospheres EXplosibles) directives regulate equipment and protective systems intended for use in potentially explosive atmospheres.'
    ),
    q(
      'Which standard defines Performance Levels (PL) for safety-related parts of control systems?',
      'IEC 61508', 'ISO 13849', 'NFPA 70E', 'IEC 60204', 'B',
      'ISO 13849 defines Performance Levels (PL a through PL e) for safety-related parts of control systems on machinery.'
    ),
    q(
      'What is the primary purpose of a safety PLC compared to a standard PLC?',
      'Faster processing speed', 'Redundant architecture to ensure safe shutdown on failure', 'Lower cost', 'More I/O capacity', 'B',
      'Safety PLCs have redundant processors and self-diagnostic capabilities to ensure the system moves to a safe state in case of any failure.'
    ),
    q(
      'According to LOTO procedures, who should hold the lock and key during maintenance?',
      'The supervisor', 'The person performing the maintenance work', 'The safety officer', 'The plant manager', 'B',
      'Each worker performing maintenance must apply their own personal lock and retain the key - this ensures only they can re-energise the equipment when their work is complete.'
    ),

    // ══════ Section 10: Overall Assessment ══════
    q(
      'A 4-20mA pressure transmitter reads 12mA. If the range is 0-100 bar, what is the pressure?',
      '25 bar', '50 bar', '75 bar', '12 bar', 'B',
      'Using linear interpolation: (12-4)/(20-4) x 100 = 8/16 x 100 = 50 bar.'
    ),
    q(
      'In an industrial control system, a PLC communicates with a SCADA system via PROFINET, and the SCADA triggers an alarm. Which layer of the automation pyramid does the alarm originate from?',
      'Field level', 'Control level', 'Supervisory level', 'Enterprise level', 'C',
      'SCADA operates at the supervisory level of the automation pyramid, above the control level (PLCs) and field level (sensors/actuators).'
    ),
    q(
      'A VFD-controlled induction motor is running at 30Hz instead of 50Hz. Approximately what percentage of rated speed is it operating at?',
      '30%', '50%', '60%', '75%', 'C',
      'Induction motor speed is proportional to frequency: 30/50 = 0.6 = 60% of rated speed.'
    ),
    q(
      'When integrating a robot with a safety PLC, which safety function ensures the robot stops if a human enters the guarded zone?',
      'Speed monitoring', 'Safe torque off with light curtain interlock', 'Position monitoring only', 'Reduced mode operation', 'B',
      'A light curtain connected to a safety PLC triggers Safe Torque Off (STO) when someone enters the guarded zone, immediately stopping the robot.'
    ),
    q(
      'In a predictive maintenance programme, a bearing vibration spectrum shows increasing amplitude at the BPFO frequency. This indicates:',
      'Shaft misalignment', 'An outer race bearing defect developing', 'Motor winding fault', 'Gear mesh problem', 'B',
      'BPFO (Ball Pass Frequency Outer race) is a characteristic frequency. Increasing amplitude at BPFO indicates an outer race defect in the bearing.'
    ),
  ];

  let qCreated = 0;
  for (const question of questions) {
    await prisma.assessmentQuestion.create({ data: question });
    qCreated++;
  }
  console.log(`Created ${qCreated} assessment questions`);

  // ─── Summary ───
  console.log('\n=== RESTRUCTURE COMPLETE ===');
  console.log(`Sessions created: ${created}`);
  console.log(`Assessment questions created: ${qCreated}`);
  console.log('Finished at:', new Date().toISOString());
}

main()
  .then(() => {
    console.log('\nScript completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nScript failed with error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

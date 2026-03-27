"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Briefcase, CheckCircle, Sparkles, ArrowRight, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    tag: "Sponsorship Secured",
    tagColor: "neon-green",
    education: "MSc Physics & MS Automation",
    prevRole: "Fresher - No Engineering Background",
    currentRole: "Control System Engineer",
    visa: "PSW - Needed Sponsorship",
    sponsorship: true,
    timeToJob: "1 month",
    interviews: "3+ interview opportunities",
    course: "Professional Module",
    color: "neon-blue",
    headline: "She Had a Physics Degree. No Engineering Experience. Every Company Said No.",
    story: `She moved to the UK with two degrees and zero interview calls. MSc in Physics. Masters in Automation. On paper, it looked promising. In reality, no one was calling back.

Month after month, applications disappeared into silence. The automation industry wanted engineers with hands-on PLC experience. She had theory. She had ambition. But she didn't have a single line of ladder logic on her CV.

By May 2024, the frustration was suffocating. Her PSW visa had a countdown. Without sponsorship, she would have to leave.

Then she found EDWartens.

The Professional Module was intense. Five days of hands-on training that compressed months of learning into hours. She programmed her first Siemens S7-1200 PLC on Day 1. By Day 3, she was configuring SCADA systems. By Day 5, she could troubleshoot industrial communication protocols that she didn't even know existed a week earlier.

But it wasn't just the technical skills. EDWartens rebuilt her entire professional profile. Resume rewritten from scratch. Interview techniques rehearsed until the answers felt natural. Mock interviews that were harder than the real ones.

Four weeks after completing the course, her phone rang three times in one week. Three different companies. Three interviews.

She got the offer as a Control System Engineer. With sponsorship.

The company that hired her said something she will never forget: "Your technical knowledge in the interview was exceptional. Where did you train?"

She answered. They wrote it down.`,
  },
  {
    id: 2,
    tag: "Career Transformation",
    tagColor: "purple",
    education: "MS Electrical Power and Energy",
    prevRole: "2+ years in non-automation roles",
    currentRole: "Multi-Skilled Maintenance Engineer",
    visa: "PSW",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "10+ interview calls",
    course: "Professional Module",
    color: "neon-green",
    headline: "Two Years in the UK. Four Interview Calls. Then Everything Changed.",
    story: `He had been applying for jobs since he landed in the UK. An MS in Electrical Power and Energy. Two years of work experience. But not in automation. And in this industry, that was the problem.

By April 2024, he had sent hundreds of applications. The result? Three, maybe four interview calls. Each one ended the same way: "We need someone with PLC experience."

He could wire a panel. He understood power systems. But the moment someone mentioned TIA Portal or ladder logic, the conversation was over.

He enrolled in EDWartens' Professional Module knowing it was his last real shot.

The training was nothing like university. No textbooks. No theory lectures. On the first morning, there was a PLC on the desk and a FactoryIO simulation on the screen. "Make it work," the instructor said. That was the lesson.

He struggled. The programming concepts were foreign. But something about touching real hardware, seeing real outputs, watching a virtual conveyor start moving because of code he wrote, made it click in a way that two years of job applications never could.

The career support was surgical. His CV was gutted and rebuilt around his new skills. His interview answers were rewritten to lead with automation knowledge. Mock interviews exposed weaknesses he didn't know he had.

Three months after completing the course, his phone wouldn't stop ringing. Ten interview calls. Companies that had ignored him for two years were suddenly interested.

He accepted an offer as a Multi-Skilled Maintenance Engineer. Same industry. Same country. Completely different career.

His friends asked what changed. He told them: "I stopped applying with a CV that said 'electrical engineer.' I started applying with one that said 'automation engineer.'"`,
  },
  {
    id: 3,
    tag: "Zero to Engineer",
    tagColor: "neon-blue",
    education: "MS Electrical Engineering",
    prevRole: "No experience - Career break",
    currentRole: "PLC Programmer",
    visa: "Dependent Visa",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "10+ interview calls",
    course: "Professional Module",
    color: "purple",
    headline: "No Experience. Major Career Break. Remote Job Seemed Impossible.",
    story: `She hadn't worked in years. An MS in Electrical Engineering sat on her wall, collecting dust alongside her confidence. Career breaks have a way of making you invisible, and she had become a ghost in every recruiter's inbox.

The challenge wasn't just technical. She needed a role near home. Remote, ideally. In industrial automation, where most jobs involve standing on a factory floor, that sounded like a fantasy.

Everyone she spoke to said the same thing: "You need experience first." But how do you get experience when no one will give you a chance?

EDWartens didn't ask about her gap years. They asked about her goals.

The Professional Module started from the very beginning. Not "engineering beginning" - absolute beginning. She had never touched a PLC. Never opened TIA Portal. The first day felt like learning a new language.

But she had something most people underestimate: electrical fundamentals. She understood circuits. She understood signals. When the instructor explained how a PLC reads inputs and drives outputs, she didn't see abstract code. She saw electricity being directed with logic instead of wire.

By Phase 3, she was writing HMI screens. By Phase 4, she had built a SCADA monitoring system in WinCC. Her project was clean, documented, and functional.

The career coaching focused on what made her different. Career breaks weren't weaknesses to hide. They were evidence of resilience. Her CV was restructured. Her LinkedIn was overhauled. Mock interviews targeted remote and flexible opportunities specifically.

Within three months, she had ten interview calls. She accepted a position as a PLC Programmer. Remote.

She works from her living room now. The same room where she used to wonder if she would ever work again.`,
  },
  {
    id: 4,
    tag: "Visa Countdown",
    tagColor: "cyan",
    education: "MS Mechanical Engineering",
    prevRole: "Fresher",
    currentRole: "Electrical Assembler",
    visa: "PSW - Expiring",
    sponsorship: false,
    timeToJob: "4 months",
    interviews: "Multiple offers",
    course: "Professional Module",
    color: "cyan",
    headline: "His Visa Was Expiring. He Had No Industrial Experience. The Clock Was Ticking.",
    story: `The calendar on his wall had a circle around one date. The day his PSW visa expired. Every morning, he counted the days. Every evening, the number was smaller and the panic was bigger.

He had a Master's in Mechanical Engineering. Brand new. Never used professionally. In the UK job market, a fresh graduate with no industrial experience is barely visible. Add a ticking visa clock, and you're not just invisible, you're desperate.

He needed a job. Not any job. A job that could transition his visa. And he needed it fast.

EDWartens' Professional Module was a calculated gamble. Five days of intensive training. Weeks of recorded sessions. He didn't have time for a slow learning curve.

The training was exactly what he needed: compressed, practical, and ruthlessly focused on employability. PLC programming on Siemens S7-1200. SCADA configuration. Industrial communication protocols. Everything an employer would test in an interview.

But it was the career support that saved him. EDWartens understood his timeline. They didn't just teach him automation. They taught him how to get hired quickly. Which companies were hiring now. Which roles matched his visa situation. How to answer the sponsorship question without killing the conversation.

Four months later, he was employed. His employer agreed to support his visa transition. The circled date on the calendar became irrelevant.

He still has that calendar. He keeps it as a reminder of how close it was.`,
  },
  {
    id: 5,
    tag: "Persistence Pays",
    tagColor: "neon-green",
    education: "MS Automation",
    prevRole: "Fresher - Repeated job rejections",
    currentRole: "Automation Engineer",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "5 months",
    interviews: "Multiple opportunities",
    course: "Professional Module",
    color: "neon-blue",
    headline: "Rejection After Rejection. His Confidence Was Gone. Then He Made One Decision.",
    story: `He came to the UK with an engineering degree and high hopes. Both proved insufficient.

The rejections came in waves. Automated emails, mostly. "Thank you for your application. Unfortunately..." He stopped reading them after the first line. After a while, he stopped counting them altogether.

Each rejection chipped away at something. Not just his confidence. His belief that he belonged here. That his education meant anything. That he was capable.

By the time he found EDWartens, he wasn't looking for training. He was looking for proof that he wasn't wasting his life.

The Professional Module didn't start with motivation speeches. It started with a PLC and a challenge. Programme this motor sequence. Now troubleshoot this fault. Now design this HMI screen.

For the first time in months, he was building something instead of begging for something. And he was good at it.

The instructor noticed. The career advisors noticed. They didn't just improve his technical skills. They rebuilt his professional identity. New CV. New interview strategy. New confidence that came not from pep talks but from genuine competence.

The interviews started coming. This time, he walked in knowing he could answer any technical question. Because he had done the work. Literally. On real hardware. With real software.

He landed a position as an Automation Engineer.

He sees his new role not just as a job, but as evidence. Evidence that persistence and the right guidance can transform a career story. Evidence that he belonged here all along.`,
  },
  {
    id: 6,
    tag: "Unskilled to Engineer",
    tagColor: "purple",
    education: "BTech Mechanical",
    prevRole: "3+ years in non-technical roles",
    currentRole: "Project Engineer",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "4 months",
    interviews: "Two job offers",
    course: "Professional Module",
    color: "neon-green",
    headline: "He Had a Master's Degree and Was Stuck in Unskilled Jobs. Nobody Saw His Potential.",
    story: `A master's degree in engineering. Three years in the UK. And he was doing work that had nothing to do with either.

Not because he couldn't do engineering. Because nobody would give him the chance to prove it. His CV said "engineer." His work history said something else entirely. And recruiters only read the work history.

The gap between his education and his reality created a kind of quiet desperation. He knew what he was capable of. The market disagreed.

EDWartens' Professional Module was his decision to stop waiting for permission.

Five days of intensive training. Then weeks of recorded sessions that he watched with the focus of someone who had everything to lose. PLC programming. HMI design. SCADA configuration. Industrial protocols.

But the real transformation happened in the career support sessions. His CV was rebuilt from scratch. Not just reformatted. Reconceptualised. His non-technical experience was reframed as evidence of work ethic, adaptability, and resilience. His new automation skills were positioned front and centre.

The mock interviews were brutal. Technical questions he hadn't considered. Scenario-based problems that required thinking on his feet. He failed the first mock. And the second. By the third, he was ready.

Two companies offered him roles. He had the luxury of choosing.

He accepted a position as a Project Engineer, designing and delivering automation solutions. The work he was always meant to do.

His friends from his old unskilled job still text him sometimes. They ask how he did it. He tells them the truth: "I stopped accepting that my job defined my capability."`,
  },
  {
    id: 7,
    tag: "Sponsorship Secured",
    tagColor: "neon-green",
    education: "BTech EEE",
    prevRole: "2+ years in non-automation role",
    currentRole: "Design & Estimation Engineer",
    visa: "Needed Sponsorship",
    sponsorship: true,
    timeToJob: "3 months",
    interviews: "Multiple interviews",
    course: "Professional Module",
    color: "cyan",
    headline: "Two Years as a Safety Engineer. The Automation Industry Wouldn't Even Look at Her.",
    story: `She had over two years of experience. Just not the right kind. Safety engineering and industrial automation share a factory floor but not a career path. Recruiters saw her CV and filed it under "not relevant."

The frustration was specific: she could see the automation jobs. She could read the requirements. She understood most of the concepts. But without "PLC experience" on her CV, every application hit the same wall.

Moving sideways in your career is supposed to be easier than starting from scratch. It isn't. Employers want proof. "Related experience" doesn't count.

EDWartens' Professional Module gave her that proof.

The training built on what she already knew. Her electrical fundamentals were solid. Her understanding of industrial environments was genuine. What she lacked was the specific technical vocabulary: PLC, HMI, SCADA, TIA Portal. Five days of hands-on training added those words to her capability, not just her CV.

The career coaching was targeted. Her existing experience wasn't discarded. It was repositioned. A safety engineer who also understands automation? That's not a career changer. That's a dual-skilled engineer. Companies pay more for those.

Within three months, she had multiple interviews. She secured a position as a Design and Estimation Engineer. With visa sponsorship.

Her new role combines both worlds. Safety compliance and automation design. The two halves of her career finally make sense together.`,
  },
  {
    id: 8,
    tag: "Service Desk to Shop Floor",
    tagColor: "neon-blue",
    education: "BTech Mechanical",
    prevRole: "3+ years as Customer Complaint Advisor",
    currentRole: "Multi-Skilled Maintenance Engineer",
    visa: "PSW - Sponsorship Secured",
    sponsorship: true,
    timeToJob: "3 months",
    interviews: "Multiple offers",
    course: "Professional Module",
    color: "neon-blue",
    headline: "Three Years Answering Customer Complaints. He Dreamed of Engineering.",
    story: `Every day for three years, he sat at a desk and listened to people complain. He was patient. He was thorough. He was slowly dying inside.

He had a BTech in Mechanical Engineering. He had moved to the UK to build an engineering career. Instead, he was building a reputation as the best complaint handler in the office.

The irony wasn't lost on him. His engineering degree helped him systematically categorise complaints. His problem-solving skills made him efficient at resolving customer issues. Every talent he had was being used for the wrong purpose.

Applications to engineering firms went nowhere. Three years of customer service experience on a CV makes you invisible to technical recruiters. They see the job title. They don't see the engineer hiding behind it.

EDWartens didn't see a complaint handler. They saw a mechanical engineer who needed a bridge.

The Professional Module was that bridge. PLC programming on Siemens S7-1200. SCADA systems. Industrial communication protocols. Each module added a layer of credibility that three years of customer service had stripped away.

The career advisors understood his specific problem. His CV needed to tell a different story. Not "customer service professional seeking engineering role." Instead: "Mechanical engineer with PLC, HMI, and SCADA skills and three years of UK work experience demonstrating reliability and communication."

Same person. Same history. Completely different narrative.

In under three months, he was a Multi-Skilled Maintenance Engineer at a reputed UK engineering firm. The complaint desk was empty.

He still uses his customer service skills. When a machine breaks down and the production team is frustrated, he listens patiently, diagnoses systematically, and resolves efficiently. Turns out, troubleshooting PLCs and handling complaints require the same temperament.`,
  },
  {
    id: 9,
    tag: "Warehouse to Engineering",
    tagColor: "cyan",
    education: "MS Automation & Project Management",
    prevRole: "6+ years in warehouse/non-automation",
    currentRole: "Transitioning to Engineering",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "3 months (first interviews)",
    interviews: "Multiple interview calls",
    course: "Professional Module",
    color: "purple",
    headline: "Six Years in a Warehouse. Two Degrees. Nobody Cared.",
    story: `Engineering degree. Project management degree. Six years in a warehouse.

That's not a career path. That's a contradiction. And he lived it every single day.

He came to the UK with qualifications that should have opened doors. Instead, he found himself stacking boxes, scanning barcodes, and watching the clock. Not because he couldn't do better. Because the UK job market has a way of trapping you in your most recent role.

After six years, his engineering degree had expired in the eyes of every recruiter. His project management qualification was irrelevant without technical credibility. He was, professionally speaking, a warehouse operative with inconvenient education.

The decision to join EDWartens' Professional Module wasn't optimistic. It was defiant. Six years of frustration compressed into a single thought: "This has to change."

The training was a reset. PLC programming. SCADA systems. Industrial protocols. Each day in the course erased a year of warehouse irrelevance. By the end of the module, his hands knew how to programme a Siemens PLC. His mind remembered it was an engineer's brain all along.

The career advisors faced a unique challenge: how to present six years of warehouse work to engineering recruiters. The answer was surprising. They didn't hide it. They highlighted it. "Six years of UK-based operational experience in logistics and warehouse management. Now transitioning to automation engineering with hands-on PLC, HMI, and SCADA skills."

Within three months, he started receiving interview calls. Engineering interview calls. For the first time in six years, someone was asking him technical questions instead of asking him to lift heavy objects.

He's not at the finish line yet. But he's no longer in the warehouse. And that, after six years, feels like everything.`,
  },
  {
    id: 10,
    tag: "Fresh Graduate Success",
    tagColor: "neon-green",
    education: "BTech Mechanical",
    prevRole: "Fresher",
    currentRole: "Mechanical Engineer",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "Multiple interviews",
    course: "Professional Module",
    color: "neon-green",
    headline: "Fresh Graduate. Strong Academics. Zero Industry Relevance.",
    story: `Top grades. Strong fundamentals. A genuine love for engineering. And absolutely no idea how to convert any of it into a job offer.

That's the fresh graduate paradox. You know enough to understand the job posting. You don't know enough to survive the interview. And every company wants "2+ years experience" for what they call "entry-level" positions.

He applied to dozens of companies. The responses fell into two categories: silence and rejection. Occasionally, a third category: rejection after a first-round interview that exposed just how wide the gap between university and industry really is.

EDWartens' Professional Module was designed for exactly this gap.

The training didn't assume he knew nothing. It assumed he knew theory and needed practice. Big difference. PLC programming moved fast because the concepts mapped onto engineering principles he already understood. HMI and SCADA built on his instinct for systems thinking.

But the real value was in what university never taught: how to present yourself to an employer. How to structure a CV when you have no experience. How to answer "Tell me about a time when..." when your only "times" were lab projects. How to demonstrate competence in fifteen minutes.

The career advisors transformed his portfolio. His university projects were reframed as engineering deliverables. His EDWartens capstone project was positioned as industry experience. His CV went from "hopeful graduate" to "automation-ready engineer."

He secured a Mechanical Engineer role that lets him apply automation skills alongside core mechanical engineering. The theory finally has a factory to live in.`,
  },
  {
    id: 11,
    tag: "First Job Secured",
    tagColor: "neon-blue",
    education: "BTech & MSc Electrical and Electronics",
    prevRole: "Fresher - No industry experience",
    currentRole: "PLC Programmer",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "Multiple opportunities",
    course: "Professional Module",
    color: "neon-blue",
    headline: "Bachelor's and Master's in EEE. Still Couldn't Get Her First Job.",
    story: `Two degrees in Electrical and Electronics Engineering. Zero job offers.

She graduated with distinction. She understood theory. She could solve problems on paper. But the UK automation industry doesn't hire based on exam scores. It hires based on what you can do with a PLC, an HMI screen, and a SCADA system. And she had never touched any of them.

The gap between academic excellence and professional readiness had never felt wider. She could explain Kirchhoff's laws but couldn't programme a simple motor start-stop sequence. She understood control theory but had never opened TIA Portal.

The Professional Module at EDWartens was her bridge from classroom to control room.

PLC programming using Siemens S7-1200 started from fundamentals but moved quickly. Ladder Logic. Structured Text. She picked it up faster than most, because her electrical foundation was genuinely strong. What she lacked wasn't intelligence. It was exposure.

The HMI design module revealed an unexpected talent. She had an eye for clean interfaces and logical screen navigation. Her SCADA project in WinCC was thorough, well-documented, and functional. The FactoryIO simulation gave her the closest thing to real industrial experience possible without standing on a factory floor.

Career coaching focused on confidence as much as competence. Mock interviews were intense. CV building was meticulous. The goal wasn't just to get interviews. It was to make sure she could perform in them.

She landed her first job as a PLC Programmer. Her first professional role. Her first salary. Her first proof that two degrees and the right training can, eventually, open the right door.`,
  },
  {
    id: 12,
    tag: "Cross-Border Success",
    tagColor: "purple",
    education: "MS Mechatronics and Robotics",
    prevRole: "Fresher",
    currentRole: "Automation Engineer",
    visa: "Netherlands Visa",
    sponsorship: false,
    timeToJob: "2.5 months",
    interviews: "8+ shortlisted",
    course: "Professional Module",
    color: "purple",
    headline: "MSc in Mechatronics. Eight Job Rejections. Then He Crossed a Border.",
    story: `A Master's in Mechatronics and Robotics should open doors. His opened exactly zero.

The problem was specific and maddening: his degree covered robotics theory, sensor fusion, and control algorithms. UK automation jobs wanted PLC programming, HMI design, and SCADA configuration. Same industry. Different language.

He applied from the Netherlands, where his visa was based. UK companies saw his qualifications and his address and his lack of hands-on PLC experience, and moved on. Eight formal rejections. Countless silent ones.

The EDWartens Professional Module was a strategic investment. Not just in skills, but in employability. He needed to translate his mechatronics knowledge into the specific vocabulary that UK automation recruiters search for.

The training did exactly that. PLC programming on Siemens S7-1200. Not robotics theory, actual industrial control. HMI screen design. Not sensor fusion, operator interfaces. SCADA system configuration. Not control algorithms, real-time monitoring.

The transition was surprisingly smooth. His mechatronics background meant he understood systems thinking. He just needed the industrial toolset.

Career support focused on cross-border job search strategy. How to position himself as a European candidate for UK roles. How to address the visa question proactively. How to demonstrate that a mechatronics engineer with PLC skills is more valuable, not less, than a traditional automation engineer.

Within two and a half months, he was shortlisted for eight positions. He accepted a role as a Junior Automation Engineer.

He commutes across borders now. His mechatronics degree and his PLC certificate sit in the same folder. Together, they tell a complete story.`,
  },
  {
    id: 13,
    tag: "Unskilled to Electrical",
    tagColor: "neon-green",
    education: "BSc Physics & MS Electrical Power and Energy",
    prevRole: "Unskilled jobs in the UK",
    currentRole: "Electrical Engineer",
    visa: "Dependent Visa",
    sponsorship: false,
    timeToJob: "4 months",
    interviews: "Multiple calls from reputed companies",
    course: "Professional Module",
    color: "neon-green",
    headline: "Physics Degree. Master's in Electrical Engineering. Working Unskilled Jobs.",
    story: `She had a BSc in Physics and a Master's in Electrical Power and Energy Systems. She was cleaning offices in the UK.

Not because she was incapable. Because when you move to a new country on a dependent visa and have no UK work experience in your field, the system doesn't care about your degrees. It cares about your most recent job. And her most recent job was unskilled.

The trap is specific: you take an unskilled job to survive. Then that unskilled job becomes your professional identity. Then every engineering application is filtered out because your work history says "cleaner," not "engineer."

She didn't know how to break the cycle. Every path required experience she didn't have. Every entry point required connections she hadn't made.

EDWartens offered something different: a reset.

The Professional Module started with electrical fundamentals she already knew. But knowing theory and applying it to a Siemens PLC are different skills. The training added layers she had never encountered in university: ladder logic, HMI configuration, SCADA design, industrial protocols.

The career support was transformative. Her CV had been a chronological disaster: degree, degree, unskilled job, unskilled job. The advisors restructured it entirely. Education and technical skills at the top. EDWartens certification front and centre. UK work experience reframed as "demonstrated reliability and UK-based work ethic."

The shift was dramatic. Where before she received nothing, she now received multiple interview calls from reputed companies. Companies that previously would not have looked at her profile.

She secured a position as an Electrical Engineer. Not a junior role. Not an internship. An engineer.

The cleaning supplies are in someone else's cupboard now. Her desk has two monitors, a PLC training kit, and a framed certificate that says she is exactly who she always knew she was.`,
  },
  {
    id: 14,
    tag: "13 Years Unlocked",
    tagColor: "cyan",
    education: "BS Electronics",
    prevRole: "13 years of industrial experience (non-UK standard)",
    currentRole: "Maintenance Engineer",
    visa: "Dependent under PSW",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "Significant increase in calls",
    course: "Professional Module",
    color: "cyan",
    headline: "Thirteen Years of Experience. Not a Single UK Interview.",
    story: `Thirteen years. Over a decade of industrial experience. Hands that had wired control cabinets, maintained motors, and troubleshot systems across multiple countries.

And in the UK, none of it counted.

The problem wasn't competence. It was presentation. His CV was written for a different market. His skill descriptions didn't match UK job listings. His technical terminology was from a different industrial culture. Recruiters scanned his application for thirty seconds and saw a foreign CV, not a veteran engineer.

After months of silence, the conclusion was devastating: thirteen years of experience had made him overqualified for entry-level roles and under-qualified (on paper) for senior ones.

EDWartens' Professional Module was not about teaching him engineering. He could teach most of the electrical modules himself. It was about translating his existing expertise into UK market language.

The PLC training added Siemens S7-1200 to his already extensive skill set. The SCADA module was familiar territory with a new interface. But the real value was in the career support. Senior industrial experts at EDWartens worked with him to rebuild his entire professional profile.

His CV was rewritten by people who understood both international engineering and UK recruitment. His thirteen years of experience weren't hidden. They were restructured, reworded, and repositioned to match exactly what UK hiring managers search for.

The result was immediate. Where before there was silence, now there were calls. Multiple interview calls from companies that had previously ignored identical qualifications presented differently.

He secured a position as a Maintenance Engineer. Not his ceiling. His starting point.

Thirteen years of experience are now visible. Not because they changed. Because the way they were presented changed. Sometimes the difference between being ignored and being hired is not what you know. It's how you say it.`,
  },
  {
    id: 15,
    tag: "4 Years Redirected",
    tagColor: "neon-blue",
    education: "BTech Mechanical",
    prevRole: "4+ years in non-automation roles",
    currentRole: "Manufacturing Operator",
    visa: "PSW - Needed Sponsorship",
    sponsorship: false,
    timeToJob: "3 months",
    interviews: "Multiple opportunities",
    course: "Professional Module",
    color: "neon-blue",
    headline: "A Mechanical Engineer Trapped in Non-Technical Work. Four Years Lost.",
    story: `Four years. That's how long a Mechanical Engineering graduate spent in non-technical roles, watching his degree become less relevant with each passing month.

He could design parts. He understood manufacturing processes. He knew thermodynamics and material science. But none of that appeared on his recent work history. What appeared was four years of non-engineering employment.

In recruitment, recency matters more than relevance. A four-year gap between your degree and your last engineering work is a career canyon. Most people never cross it.

EDWartens' Professional Module was his bridge.

The training started with familiar territory. Mechanical engineers understand how things move, how forces interact, how systems behave. PLC programming added the "why" to the "how." He could now not only understand a machine but programme one.

The hands-on approach mattered enormously. Real PLC hardware. Ladder Logic and Structured Text programming. HMI design using real tools. SCADA development in WinCC. FactoryIO simulations that recreated the factory environments he should have been working in for the past four years.

EDWartens gave him the platform he needed: structured learning, real industrial hardware, and simulation-based practice that generated genuine technical confidence.

He secured a position as a Manufacturing Operator at a reputed UK company. A starting point that puts him back on the engineering trajectory he left four years ago.

He now operates, monitors, and helps improve industrial machinery and control processes. The mechanical engineer is finally doing mechanical engineering. Plus automation. Which, in 2025, is what mechanical engineering has become.`,
  },
];

type FilterKey = "all" | "sponsorship" | "career-changers" | "fresh-graduates" | "international";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sponsorship", label: "Sponsorship Secured" },
  { key: "career-changers", label: "Career Changers" },
  { key: "fresh-graduates", label: "Fresh Graduates" },
  { key: "international", label: "International" },
];

function matchesFilter(cs: (typeof caseStudies)[number], filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "sponsorship") {
    return cs.sponsorship === true || cs.tag.toLowerCase().includes("sponsorship");
  }
  if (filter === "career-changers") {
    const prev = cs.prevRole.toLowerCase();
    return (
      prev.includes("non-automation") ||
      prev.includes("non-technical") ||
      prev.includes("unskilled") ||
      prev.includes("warehouse") ||
      prev.includes("customer complaint") ||
      prev.includes("career break") ||
      prev.includes("non-uk standard")
    );
  }
  if (filter === "fresh-graduates") {
    return cs.prevRole.toLowerCase().includes("fresher");
  }
  if (filter === "international") {
    const text = `${cs.visa} ${cs.headline} ${cs.tag}`.toLowerCase();
    return text.includes("visa") || text.includes("netherlands") || text.includes("cross-border");
  }
  return true;
}

const tagColorMap: Record<string, string> = {
  "neon-green": "bg-neon-green/10 text-neon-green",
  purple: "bg-purple-500/10 text-purple-400",
  "neon-blue": "bg-neon-blue/10 text-neon-blue",
  cyan: "bg-cyan-500/10 text-cyan-400",
};

export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filtered = caseStudies.filter((cs) => matchesFilter(cs, activeFilter));

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10 text-center">
          <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Real Stories, Real Careers</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Case <span className="gradient-text">Studies</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Real stories of real people who transformed their careers through EDWartens.
            Different backgrounds. Different challenges. One common outcome: an engineering career in the UK.
          </p>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="rounded-xl bg-neon-blue/5 border border-neon-blue/20 p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-neon-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary leading-relaxed">
              To protect the privacy of our graduates, all names and identifying details have been removed from these case studies. The experiences described are real.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "15", label: "Success Stories" },
              { value: "100%", label: "Career Transformation" },
              { value: "3 mo", label: "Average Time to Job" },
              { value: "10+", label: "Avg Interview Calls" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                <div className="text-2xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? "bg-neon-blue text-white shadow-lg shadow-neon-blue/25"
                    : "glass-card text-text-muted hover:text-white hover:border-white/20"
                }`}
              >
                {f.label}
                {f.key !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({caseStudies.filter((cs) => matchesFilter(cs, f.key)).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((cs) => {
              const isExpanded = expandedIds.has(cs.id);
              return (
                <article key={cs.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    {/* Tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${tagColorMap[cs.tagColor] || "bg-white/10 text-text-muted"}`}>
                        {cs.tag}
                      </span>
                      {cs.sponsorship && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-green/10 text-[11px] text-neon-green">
                          <CheckCircle size={10} /> Sponsored
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h2 className="text-base sm:text-lg font-bold text-white mb-3 leading-snug line-clamp-2">
                      {cs.headline}
                    </h2>

                    {/* Before -> After */}
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="text-text-muted truncate">{cs.prevRole}</span>
                      <ArrowRight size={14} className="text-neon-green flex-shrink-0" />
                      <span className="text-white font-medium truncate">{cs.currentRole}</span>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-text-muted">
                        <Clock size={10} /> {cs.timeToJob}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-text-muted">
                        <Briefcase size={10} /> {cs.interviews}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neon-blue/10 text-[11px] text-neon-blue">
                        <Sparkles size={10} /> {cs.course}
                      </span>
                    </div>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleExpand(cs.id)}
                      className="mt-auto flex items-center gap-1.5 text-sm font-medium text-neon-blue hover:text-neon-blue/80 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Hide Story <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Read Story <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Story */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-5 sm:p-6">
                      <div className="space-y-3">
                        {cs.story.split("\n\n").map((paragraph, i) => (
                          <p key={i} className="text-sm text-text-secondary leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted">No case studies match this filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4">
            <p className="text-[11px] text-text-muted leading-relaxed">
              These case studies are based on real student experiences. Names and identifying details have been
              removed to protect privacy. Career outcomes vary based on individual qualifications, effort,
              market conditions, and visa eligibility. EDWartens provides training and career support but
              does not guarantee employment or visa outcomes. Time-to-job figures reflect individual experiences
              and are not guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Write <span className="gradient-text">Your Story?</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Every story above started with someone who decided to stop waiting and start building.
            Book a free consultation and find out which course is right for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              Explore Courses <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

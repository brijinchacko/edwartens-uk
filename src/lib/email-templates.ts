export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
}

/* ─── Signature Block ────────────────────────────────────────────── */
const signature = `
<br/><br/>Many Thanks<br/>
<strong>{{counsellorName}}</strong><br/>
{{counsellorTitle}} | <a href="https://www.wartens.com" style="color:#2891FF;text-decoration:none;">www.wartens.com</a><br/><br/>
T: 0333 33 98 394<br/>
M: {{counsellorPhone}}<br/>
E: {{counsellorEmail}}<br/>
A: Wartens Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX
`;

/* ─── HTML wrapper with EDWartens branding ───────────────────────── */
function wrap(content: string): string {
  return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1a1a2e;line-height:1.6;font-size:14px;">
  <div style="background:#2891FF;padding:16px 24px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">EDWartens UK</h2>
    <p style="margin:2px 0 0;color:rgba(255,255,255,0.85);font-size:11px;">Industrial Automation Training &amp; Career Support</p>
  </div>
  <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
${content}
${signature}
  </div>
</div>`;
}

/* ─── All Variables Supported ────────────────────────────────────── */
const ALL_VARS = [
  "name",
  "firstName",
  "email",
  "phone",
  "course",
  "counsellorName",
  "counsellorEmail",
  "counsellorPhone",
  "counsellorTitle",
  "companyName",
];

/* ═══════════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

export const emailTemplates: EmailTemplate[] = [
  // ─── INITIAL CONTACT ──────────────────────────────────────────────
  {
    id: "initial-quick-recap",
    name: "Quick Recap — Automation Training & Career Support",
    category: "Initial Contact",
    subject: "Quick Recap — Automation Training & Career Support",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>It was great speaking with you! As promised, here is a quick recap of what we discussed about our <strong>Industrial Automation Training</strong> programme at <strong>{{companyName}}</strong>.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What We Offer — End-to-End Industrial Training</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li><strong>PLC Programming</strong> — Siemens TIA Portal, Allen-Bradley Studio 5000</li>
      <li><strong>SCADA Systems</strong> — WinCC, FactoryTalk View</li>
      <li><strong>HMI Development</strong> — Interface design &amp; commissioning</li>
      <li><strong>Industrial Networking &amp; Safety Systems</strong></li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Why EDWartens?</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>CPD Accredited certification recognised across the UK</li>
      <li>Hands-on experience with real industrial equipment &amp; projects</li>
      <li>50+ hiring partners actively recruiting our graduates</li>
      <li>Dedicated career support from CV building to placement</li>
    </ul>

    <p>I would love to schedule a quick <strong>Microsoft Teams call</strong> to walk you through the course in more detail and answer any questions you may have. Would any time this week suit you?</p>
    <p>Looking forward to hearing from you!</p>`),
  },
  {
    id: "initial-enquiry-thankyou",
    name: "Thank You for Your Enquiry",
    category: "Initial Contact",
    subject: "Thank You for Your Enquiry — {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thank you for your enquiry about our training programmes! We are excited about your interest in advancing your career with <strong>{{companyName}}</strong>.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Our Programmes</h3>
    <p>We specialise in <strong>Industrial Automation Training</strong> covering PLC, SCADA, HMI, Industrial Networking, and Safety Systems. Our courses are CPD Accredited and designed to get you job-ready with hands-on experience and dedicated career support.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Next Steps</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Book a <strong>free consultation call</strong> so we can understand your goals</li>
      <li>Review the course brochure and syllabus</li>
      <li>Secure your spot in the upcoming batch</li>
    </ol>

    <p>I would love to schedule a quick call to walk you through everything in detail. When would be a good time for you this week?</p>`),
  },
  {
    id: "initial-welcome",
    name: "Welcome to EDWartens",
    category: "Initial Contact",
    subject: "Welcome to EDWartens — Let's Get Started!",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>It was wonderful connecting with you! On behalf of the team at <strong>{{companyName}}</strong>, I wanted to extend a warm welcome.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Who We Are</h3>
    <p>EDWartens UK is a <strong>CPD Accredited</strong> training provider specialising in Industrial Automation. We have helped hundreds of professionals transition into high-paying automation roles across the UK.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Our Programmes</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li><strong>Professional Module</strong> — PLC, SCADA, HMI, Industrial Networking &amp; Safety</li>
      <li><strong>Siemens Module</strong> — Deep-dive into Siemens TIA Portal</li>
      <li><strong>Career Support</strong> — CV building, interview prep &amp; placement with 50+ partners</li>
    </ul>

    <p>I would love to learn more about your background and goals. Would you be available for a quick 15-minute call this week?</p>`),
  },
  {
    id: "initial-career-change",
    name: "Career Change into Automation",
    category: "Initial Contact",
    subject: "Considering a Career Change? Here's How We Can Help",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thinking about a career change can feel daunting, but you are not alone — and it is absolutely achievable with the right support.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">How {{companyName}} Helps Career Changers</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li><strong>No prior automation experience required</strong> — we start from the fundamentals</li>
      <li><strong>Structured learning path</strong> designed for career changers</li>
      <li><strong>Real-world projects</strong> that build your portfolio from Day 1</li>
      <li><strong>Dedicated career coach</strong> to guide your transition into industry</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Success Stories</h3>
    <p>Many of our graduates came from completely different backgrounds — retail, hospitality, admin, military — and are now working as PLC Engineers, SCADA Developers, and Automation Technicians across the UK.</p>
    <p><a href="https://wartens.co.uk/case-studies/" style="color:#2891FF;text-decoration:underline;">Read Their Stories</a></p>

    <p>I would be happy to chat about your situation and explore how our programme could work for you. Fancy a quick call?</p>`),
  },

  // ─── POST-CONSULTATION ────────────────────────────────────────────
  {
    id: "post-thankyou-resources",
    name: "Thank You for Attending — Resources & Next Steps",
    category: "Post-Consultation",
    subject: "Thank You for Attending — Resources & Next Steps",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thank you for taking the time to speak with us today! It was wonderful learning about your background and career aspirations.</p>
    <p>As discussed, here are the key resources and next steps:</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Documents Shared</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>UK Opportunities Brochure</li>
      <li>Payment Details &amp; Fee Structure</li>
      <li>Professional Module Syllabus</li>
      <li>Siemens Module Syllabus</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Case Studies</h3>
    <p>Have a look at some of our success stories to see how our graduates have transitioned into automation roles:</p>
    <p><a href="https://wartens.co.uk/case-studies/" style="color:#2891FF;text-decoration:underline;">View Case Studies</a></p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Next Steps</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Review the brochure and syllabus at your convenience</li>
      <li>Let us know if you have any questions</li>
      <li>Confirm your enrolment to secure your seat in the upcoming batch</li>
    </ol>

    <p>Feel free to reach out anytime — I am here to help!</p>`),
  },
  {
    id: "post-resources-reshare",
    name: "Resources & Next Steps (Reshare)",
    category: "Post-Consultation",
    subject: "Resharing — Resources & Next Steps | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thank you once again for your time! As discussed, I am resharing the key details and resources for your reference.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Attached Documents</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>UK Opportunities Brochure</li>
      <li>Payment Details &amp; Fee Structure</li>
      <li>Professional Module Syllabus</li>
      <li>Siemens Module Syllabus</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Case Studies &amp; Success Stories</h3>
    <p>See how our graduates have successfully transitioned into automation careers:</p>
    <p><a href="https://wartens.co.uk/case-studies/" style="color:#2891FF;text-decoration:underline;">View Case Studies</a></p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Next Steps</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Review the attached materials</li>
      <li>Reach out with any questions</li>
      <li>Confirm your enrolment to reserve your seat</li>
    </ol>

    <p>I am here to support you every step of the way. Do not hesitate to reach out!</p>`),
  },
  {
    id: "post-consultation-summary",
    name: "Consultation Summary & Action Items",
    category: "Post-Consultation",
    subject: "Consultation Summary & Action Items — {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thank you for the productive consultation today. Here is a summary of what we discussed and the agreed action items.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Summary</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Reviewed your background and career goals</li>
      <li>Discussed the Professional Module and Siemens Module curriculum</li>
      <li>Covered the training format, schedule, and batch options</li>
      <li>Explained the fee structure and payment options</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Action Items</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li><strong>You:</strong> Review the brochure and syllabus documents</li>
      <li><strong>You:</strong> Confirm preferred batch and payment plan</li>
      <li><strong>Us:</strong> Share software installation guides upon enrolment</li>
      <li><strong>Us:</strong> Reserve your seat once enrolment is confirmed</li>
    </ol>

    <p>Please do not hesitate to reach out if anything is unclear or you need further information. I am happy to schedule another call if that helps.</p>`),
  },

  // ─── PAYMENT ──────────────────────────────────────────────────────
  {
    id: "payment-confirmation",
    name: "Payment Confirmation & Next Steps",
    category: "Payment",
    subject: "Payment Confirmation & Next Steps — {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>We are pleased to confirm that we have received your token/deposit payment of <strong>&pound;100</strong>. Thank you!</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:16px 0;">
      <h3 style="color:#16a34a;font-size:15px;margin:0 0 8px;">Payment Confirmed</h3>
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 8px;font-weight:600;">Deposit Paid:</td><td style="padding:4px 8px;">&pound;100</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Remaining Amount:</td><td style="padding:4px 8px;">&pound;2,468 (including VAT)</td></tr>
      </table>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What Happens Next</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Your seat is now reserved in the upcoming batch</li>
      <li>You will receive onboarding instructions and access to recorded sessions</li>
      <li>Software installation guides will be shared before training begins</li>
      <li>Remaining payment can be made before or during the training period</li>
    </ol>

    <p>If you have any questions about the remaining payment or need a flexible plan, please let me know. Welcome aboard!</p>`),
  },
  {
    id: "payment-invoice",
    name: "Invoice & Payment Details",
    category: "Payment",
    subject: "Invoice & Payment Details — {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Thank you for choosing <strong>{{companyName}}</strong> for your Industrial Automation training. Here are the payment details for your records.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Fee Structure</h3>
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;padding:16px;border-radius:8px;margin:12px 0;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 8px;font-weight:600;">Total Course Fee:</td><td style="padding:4px 8px;">&pound;2,568 (including VAT)</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Deposit Option:</td><td style="padding:4px 8px;">&pound;100 to secure your seat</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Remaining Balance:</td><td style="padding:4px 8px;">&pound;2,468 (payable before or during training)</td></tr>
      </table>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Bank Transfer Details</h3>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;margin:12px 0;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 8px;font-weight:600;">Account Name:</td><td style="padding:4px 8px;">Wartens Ltd</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Sort Code:</td><td style="padding:4px 8px;">[To be provided]</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Account Number:</td><td style="padding:4px 8px;">[To be provided]</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Reference:</td><td style="padding:4px 8px;">Your Full Name</td></tr>
      </table>
    </div>

    <p>Please share a screenshot of your payment confirmation so we can process your enrolment. If you have any questions or prefer a flexible payment plan, please reach out.</p>`),
  },
  {
    id: "payment-reminder",
    name: "Payment Reminder — Complete Your Enrollment",
    category: "Payment",
    subject: "Friendly Reminder — Complete Your Enrollment | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>I hope you are doing well. This is a friendly reminder that we have an outstanding payment on your account for the Industrial Automation Training programme.</p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Amount Due:</strong> Please refer to your invoice for the exact balance</p>
      <p style="margin:4px 0 0;font-size:13px;color:#374151;"><strong>Payment Methods:</strong> Bank Transfer / Card Payment</p>
    </div>

    <p>Completing your payment ensures you can:</p>
    <ul style="padding-left:20px;color:#374151;">
      <li>Retain your reserved seat in the upcoming batch</li>
      <li>Access all course materials and recorded sessions</li>
      <li>Receive your CPD Accredited certificate upon completion</li>
      <li>Unlock career support and placement assistance</li>
    </ul>

    <p>If you are experiencing any difficulties or would like to discuss a flexible payment plan, please do not hesitate to reach out. We are here to help and want to ensure you can continue your training without interruption.</p>`),
  },

  // ─── FOLLOW-UP ────────────────────────────────────────────────────
  {
    id: "followup-checking-in",
    name: "Checking In — Any Questions?",
    category: "Follow-up",
    subject: "Checking In — Any Questions? | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>I hope you are doing well! I just wanted to check in following our recent conversation about the Industrial Automation Training programme.</p>
    <p>I understand these decisions take time, and I wanted to let you know that I am still available to answer any questions you may have about the course, schedule, or career outcomes.</p>
    <p>Is there anything specific I can help with? Happy to jump on a quick call if that is easier.</p>
    <p>Looking forward to hearing from you.</p>`),
  },
  {
    id: "followup-limited-batch",
    name: "Limited Batch Availability",
    category: "Follow-up",
    subject: "Limited Seats — Next Batch Filling Up | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>I wanted to give you a quick heads-up that our upcoming training batch is filling up fast.</p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Batch Update:</strong> Only a few seats remain in the current batch. The next available batch after this will be announced soon.</p>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Why Secure Your Seat Now?</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Small batch sizes ensure personalised attention</li>
      <li>Earlier start means earlier entry into the job market</li>
      <li>Career support begins from Day 1 of your training</li>
      <li>Lock in current pricing before any changes</li>
    </ul>

    <p>If you would like to confirm your place or have any questions, I am here to help. A quick &pound;100 deposit is all it takes to secure your seat.</p>`),
  },
  {
    id: "followup-early-bird",
    name: "Special Offer — Early Bird Discount",
    category: "Follow-up",
    subject: "Special Offer — Early Bird Discount | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>I have some great news! We are running a <strong>limited-time early bird offer</strong> for our upcoming Industrial Automation Training batch.</p>

    <div style="background:linear-gradient(135deg,#2891FF 0%,#1d6fd1 100%);color:#ffffff;padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
      <h2 style="margin:0;font-size:20px;">Early Bird Offer</h2>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Enrol this week and receive a special discount on your course fee</p>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What You Get</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Comprehensive PLC, SCADA &amp; HMI training</li>
      <li>CPD Accredited certification</li>
      <li>Lifetime access to recorded sessions</li>
      <li>Dedicated career support &amp; placement assistance</li>
      <li>Special pricing for early enrolment</li>
    </ul>

    <p>This offer is available for a limited time only. If you would like to take advantage of it, simply reply to this email or give me a call.</p>`),
  },
  {
    id: "followup-reengagement",
    name: "We Haven't Heard from You",
    category: "Follow-up",
    subject: "We'd Love to Reconnect — {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>It has been a while since we last connected, and I wanted to reach out to see how you are doing.</p>
    <p>A lot has been happening at <strong>{{companyName}}</strong> since we last spoke, and I thought you might be interested:</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What&rsquo;s New</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Updated curriculum with the latest PLC/SCADA technologies</li>
      <li>New hiring partnerships with leading automation companies</li>
      <li>Enhanced career support with dedicated placement team</li>
      <li>Fresh success stories from our recent graduates</li>
    </ul>

    <p><a href="https://wartens.co.uk/case-studies/" style="color:#2891FF;text-decoration:underline;">See Our Latest Case Studies</a></p>

    <p>If the timing is right for you now, I would be happy to reconnect and discuss how we can support your career goals. No pressure at all — just let me know when you are ready.</p>`),
  },

  // ─── ONBOARDING ───────────────────────────────────────────────────
  {
    id: "onboarding-welcome",
    name: "Welcome Aboard — Getting Started",
    category: "Onboarding",
    subject: "Welcome Aboard — Getting Started with {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>

    <div style="background:linear-gradient(135deg,#2891FF 0%,#1d6fd1 100%);color:#ffffff;padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
      <h2 style="margin:0;font-size:20px;">Welcome to {{companyName}}!</h2>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Your journey into Industrial Automation starts now</p>
    </div>

    <p>We are thrilled to have you on board! Here is everything you need to get started:</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Immediate Next Steps</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li><strong>Software Installation</strong> — Install Siemens TIA Portal (guide attached or will follow)</li>
      <li><strong>Documents</strong> — Please send us a copy of your photo ID and updated CV</li>
      <li><strong>Microsoft Teams</strong> — Ensure you have Teams installed for live sessions</li>
      <li><strong>Student Group</strong> — You will be added to the batch WhatsApp group</li>
    </ol>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What to Expect</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li><strong>Week 1-2:</strong> Foundation modules and software setup</li>
      <li><strong>Week 3+:</strong> Hands-on PLC/SCADA programming</li>
      <li><strong>Ongoing:</strong> Project work and real-world scenarios</li>
      <li><strong>Post-Training:</strong> Career support and placement assistance</li>
    </ul>

    <p>If you need help with anything at all, we are just an email or call away. Let us make this a great experience!</p>`),
  },
  {
    id: "onboarding-software",
    name: "Software Installation Guide",
    category: "Onboarding",
    subject: "Software Installation Guide — Pre-Training Setup",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Your training batch is starting soon! Please follow this guide to get your software set up before the first session.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Required Software</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>
        <strong>Siemens TIA Portal V17+</strong>
        <ul style="padding-left:16px;margin:4px 0;">
          <li>Download link and licence key will be provided</li>
          <li>Requires Windows 10/11 (64-bit)</li>
          <li>Minimum 16 GB RAM recommended</li>
          <li>At least 50 GB free disk space</li>
        </ul>
      </li>
      <li>
        <strong>Microsoft Teams</strong>
        <ul style="padding-left:16px;margin:4px 0;">
          <li>For live instructor-led sessions</li>
          <li>Download from <a href="https://teams.microsoft.com" style="color:#2891FF;">teams.microsoft.com</a></li>
        </ul>
      </li>
      <li>
        <strong>Additional Software</strong> — Any other tools required will be communicated by your instructor
      </li>
    </ol>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Troubleshooting</h3>
    <p>If you encounter any issues during installation, please do not worry — reach out to us and we will help you get sorted before the batch begins.</p>

    <div style="background:#f0f7ff;border-left:4px solid #2891FF;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Tip:</strong> Complete the installation at least 48 hours before your first session so we have time to troubleshoot if needed.</p>
    </div>`),
  },
  {
    id: "onboarding-batch-starts",
    name: "Your Batch Starts Soon",
    category: "Onboarding",
    subject: "Your Batch Starts Soon — Preparation Checklist",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Exciting times — your training batch is just around the corner! Here is your pre-training checklist to make sure you are fully prepared.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Preparation Checklist</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>&#9745; Siemens TIA Portal installed and working</li>
      <li>&#9745; Microsoft Teams installed and tested</li>
      <li>&#9745; Stable internet connection confirmed</li>
      <li>&#9745; Photo ID and CV submitted</li>
      <li>&#9745; Notebook ready for hands-on exercises</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Session Details</h3>
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;padding:16px;border-radius:8px;margin:12px 0;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 8px;font-weight:600;">Start Date:</td><td style="padding:4px 8px;">[To be confirmed]</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Schedule:</td><td style="padding:4px 8px;">[To be confirmed]</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Format:</td><td style="padding:4px 8px;">Live Online via Microsoft Teams</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Teams Link:</td><td style="padding:4px 8px;">Will be shared 24 hours before the first session</td></tr>
      </table>
    </div>

    <p>If anything on the checklist is not ready yet, please reach out and we will help you get sorted. See you soon!</p>`),
  },

  // ─── POST-TRAINING ────────────────────────────────────────────────
  {
    id: "post-certificate",
    name: "Certificate Ready for Collection",
    category: "Post-Training",
    subject: "Congratulations! Your CPD Certificate is Ready",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>

    <div style="background:linear-gradient(135deg,#2891FF 0%,#1d6fd1 100%);color:#ffffff;padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
      <h2 style="margin:0;font-size:20px;">Congratulations!</h2>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">You have successfully completed your training</p>
    </div>

    <p>We are proud to inform you that your <strong>CPD Accredited Certificate</strong> has been generated and is ready for you. Please find it attached to this email or download it via the link below.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Add It to LinkedIn</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Go to your LinkedIn profile</li>
      <li>Click <strong>Add profile section</strong> &rarr; <strong>Licenses &amp; Certifications</strong></li>
      <li>Enter: <strong>Industrial Automation (CPD Accredited) — EDWartens UK</strong></li>
      <li>Upload your certificate as media</li>
    </ol>

    <p>This is a significant achievement — well done! Your dedicated career coach will be in touch shortly to discuss the next steps in your career journey.</p>`),
  },
  {
    id: "post-career-support",
    name: "Career Support — Let's Get You Placed",
    category: "Post-Training",
    subject: "Career Support — Let's Get You Placed | {{companyName}}",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>Now that you have completed your training, it is time to focus on getting you into your first (or next) automation role. Our career support team is here to help every step of the way.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Career Support Services</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li><strong>CV Review &amp; Optimisation</strong> — Tailored for automation roles</li>
      <li><strong>LinkedIn Profile Enhancement</strong></li>
      <li><strong>Mock Interview Preparation</strong></li>
      <li><strong>Job Board Access</strong> — 50+ hiring partners actively recruiting</li>
      <li><strong>Dedicated Placement Support</strong></li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Next Steps</h3>
    <ol style="padding-left:20px;color:#374151;">
      <li>Send us your updated CV (we will review and optimise it)</li>
      <li>Schedule your mock interview session</li>
      <li>Start applying via our job board and partner network</li>
    </ol>

    <p>We are invested in your success. Let us know when you are ready to get started, and we will match you with opportunities that fit your skills and goals.</p>`),
  },
  {
    id: "post-feedback",
    name: "Feedback Request — How Was Your Experience?",
    category: "Post-Training",
    subject: "How Was Your Experience? — We'd Love Your Feedback",
    variables: ALL_VARS,
    body: wrap(`
    <p>Hi {{firstName}},</p>
    <p>We hope you enjoyed your training experience with <strong>{{companyName}}</strong>! Your feedback is incredibly important to us and helps us continue improving our programmes.</p>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">We Would Love to Hear From You</h3>
    <p>Could you take a few minutes to share your thoughts on the following?</p>
    <ul style="padding-left:20px;color:#374151;">
      <li>Overall training quality and content</li>
      <li>Instructor knowledge and delivery</li>
      <li>Course materials and resources</li>
      <li>Career support experience</li>
      <li>Anything we could improve</li>
    </ul>

    <p>You can reply directly to this email with your feedback, or if you prefer, we can arrange a quick call.</p>

    <div style="background:#f0f7ff;border-left:4px solid #2891FF;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Bonus:</strong> If you are happy with your experience, we would really appreciate a Google review or LinkedIn recommendation. It helps other aspiring automation professionals find us!</p>
    </div>

    <p>Thank you for being part of the {{companyName}} family. We wish you every success in your automation career!</p>`),
  },

  // ─── PRACTICAL SESSION ─────────────────────────────────────────────
  {
    id: "practical-session-invitation",
    name: "Practical Session Invitation",
    category: "Practical Session",
    subject: "Your Practical Session is Confirmed -- {{date}} | EDWartens UK",
    variables: ["name", "firstName", "date", "time", "venue", "deadline", "trainerName", ...ALL_VARS],
    body: wrap(`
    <p>Hi {{firstName}},</p>

    <p>Great news! Your <strong>Practical Training Session</strong> at our Milton Keynes centre has been scheduled. Please review the details below and confirm your attendance.</p>

    <div style="background:#f0f7ff;border:1px solid #d0e3ff;border-radius:8px;padding:16px 20px;margin:16px 0;">
      <h3 style="color:#2891FF;font-size:15px;margin:0 0 12px;">Session Details</h3>
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;font-weight:600;width:120px;">Date:</td><td>{{date}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Time:</td><td>{{time}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Venue:</td><td>{{venue}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Trainer:</td><td>{{trainerName}}</td></tr>
      </table>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Venue Rules &amp; Requirements</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Arrive <strong>15 minutes early</strong> for registration and setup</li>
      <li>Bring your <strong>laptop</strong> with TIA Portal installed</li>
      <li>Wear <strong>appropriate footwear</strong> (closed-toe shoes required)</li>
      <li>No food or drinks near equipment</li>
      <li><strong>Photo ID</strong> is required for entry</li>
    </ul>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">What You Will Cover</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Hands-on PLC programming with real industrial hardware</li>
      <li>Panel wiring and troubleshooting exercises</li>
      <li>HMI configuration and testing</li>
      <li>Real-world scenario-based challenges</li>
    </ul>

    <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Important:</strong> Please confirm your attendance by <strong>{{deadline}}</strong>. Once confirmed, cancellation will mean no future free practical sessions will be offered.</p>
    </div>

    <p>Please log in to your <a href="https://app.edwartens.com/student/practical" style="color:#2891FF;text-decoration:none;font-weight:600;">Student Portal</a> to accept or decline this invitation.</p>

    <p>We look forward to seeing you there!</p>`),
  },
  {
    id: "practical-session-reminder",
    name: "Practical Session Reminder",
    category: "Practical Session",
    subject: "Reminder: Practical Session on {{date}} -- Please Confirm | EDWartens UK",
    variables: ["name", "firstName", "date", "time", "venue", "deadline", "trainerName", ...ALL_VARS],
    body: wrap(`
    <p>Hi {{firstName}},</p>

    <p>This is a friendly reminder that your <strong>Practical Training Session</strong> is coming up soon! If you have not yet confirmed your attendance, please do so as soon as possible.</p>

    <div style="background:#f0f7ff;border:1px solid #d0e3ff;border-radius:8px;padding:16px 20px;margin:16px 0;">
      <h3 style="color:#2891FF;font-size:15px;margin:0 0 12px;">Session Details</h3>
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;font-weight:600;width:120px;">Date:</td><td>{{date}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Time:</td><td>{{time}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Venue:</td><td>{{venue}}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Trainer:</td><td>{{trainerName}}</td></tr>
      </table>
    </div>

    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#374151;"><strong>Booking Deadline: {{deadline}}</strong></p>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">If we do not receive at least 3 confirmed bookings by the deadline, the session may be cancelled or rescheduled. Please confirm at your earliest convenience.</p>
    </div>

    <h3 style="color:#2891FF;font-size:15px;margin:20px 0 8px;">Capacity Rules</h3>
    <ul style="padding-left:20px;color:#374151;">
      <li>Maximum <strong>6 students</strong> per session for optimal hands-on experience</li>
      <li>Minimum <strong>3 confirmed bookings</strong> required for the session to proceed</li>
      <li>First-come, first-served basis once capacity is reached</li>
    </ul>

    <p>Please log in to your <a href="https://app.edwartens.com/student/practical" style="color:#2891FF;text-decoration:none;font-weight:600;">Student Portal</a> to confirm your attendance now.</p>

    <p>If you have any questions or need to discuss alternative dates, please do not hesitate to reach out.</p>`),
  },
];

/* ─── Utility Functions ──────────────────────────────────────────── */

export function getTemplatesByCategory(): Record<string, EmailTemplate[]> {
  const grouped: Record<string, EmailTemplate[]> = {};
  for (const t of emailTemplates) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }
  return grouped;
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.id === id);
}

/**
 * Replace {{variable}} placeholders in HTML with provided values.
 * Supports all variable names: name, firstName, email, phone, course,
 * counsellorName, counsellorEmail, counsellorPhone, counsellorTitle, companyName.
 *
 * Also supports legacy aliases for backwards compatibility:
 * - candidateName → name
 * - senderName → counsellorName
 * - senderEmail → counsellorEmail
 * - senderPhone → counsellorPhone
 * - senderTitle → counsellorTitle
 */
export function fillTemplate(
  html: string,
  variables: Record<string, string>
): string {
  // Legacy alias mapping
  const aliasMap: Record<string, string> = {
    candidateName: "name",
    senderName: "counsellorName",
    senderEmail: "counsellorEmail",
    senderPhone: "counsellorPhone",
    senderTitle: "counsellorTitle",
  };

  // Build merged variables with aliases resolved
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(variables)) {
    merged[key] = value;
    // If the key is a legacy alias, also set the new key
    if (aliasMap[key] && !variables[aliasMap[key]]) {
      merged[aliasMap[key]] = value;
    }
  }

  // Derive firstName from name if not explicitly provided
  if (merged.name && !merged.firstName) {
    merged.firstName = merged.name.split(" ")[0];
  }

  // Default company name
  if (!merged.companyName) {
    merged.companyName = "EDWartens UK";
  }

  let result = html;
  for (const [key, value] of Object.entries(merged)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

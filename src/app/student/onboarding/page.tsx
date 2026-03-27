"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  X,
  Loader2,
  CreditCard,
  PartyPopper,
} from "lucide-react";

interface ProfileData {
  name: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  qualification: string;
}

interface UploadedFile {
  name: string;
  type: string;
  url?: string;
  file?: File;
}

const steps = [
  "Terms & Conditions",
  "Complete Profile",
  "Upload Documents",
  "Payment",
  "Done",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2: Profile
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    qualification: "",
  });

  // Step 3: Documents
  const [idProof, setIdProof] = useState<UploadedFile | null>(null);
  const [qualificationCert, setQualificationCert] =
    useState<UploadedFile | null>(null);
  const [cv, setCv] = useState<UploadedFile | null>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const qualRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  // Step 4: Payment
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [courseFee, setCourseFee] = useState<number>(0);

  // Load user data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth
              ? data.dateOfBirth.split("T")[0]
              : "",
            address: data.address || "",
            emergencyName: data.emergencyName || "",
            emergencyPhone: data.emergencyPhone || "",
            qualification: data.qualification || "",
          });
          setPaymentStatus(data.paymentStatus || "PENDING");
          setCourseFee(data.courseFee || 2140);
          if (data.termsAccepted) {
            setTermsAccepted(true);
          }
        }
      } catch {
        // Ignore load errors, user can fill fresh
      }
    }
    loadProfile();
  }, []);

  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      if (currentStep === 0) {
        // Accept terms
        if (!termsAccepted) {
          setError("You must accept the terms and conditions to proceed.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/student/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "terms", accepted: true }),
        });
        if (!res.ok) throw new Error("Failed to save terms acceptance");
      }

      if (currentStep === 1) {
        // Validate profile
        if (
          !profile.name ||
          !profile.phone ||
          !profile.dateOfBirth ||
          !profile.address ||
          !profile.emergencyName ||
          !profile.emergencyPhone ||
          !profile.qualification
        ) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/student/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "profile", ...profile }),
        });
        if (!res.ok) throw new Error("Failed to save profile");
      }

      if (currentStep === 2) {
        // Validate documents
        if (!idProof || !qualificationCert) {
          setError(
            "ID Proof and Qualification Certificate are required."
          );
          setLoading(false);
          return;
        }
        // Upload documents
        const formData = new FormData();
        if (idProof.file) formData.append("idProof", idProof.file);
        if (qualificationCert.file)
          formData.append("qualificationCert", qualificationCert.file);
        if (cv?.file) formData.append("cv", cv.file);

        formData.append("step", "documents");
        const res = await fetch("/api/student/onboarding", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload documents");
      }

      if (currentStep === 3) {
        // Payment step - mark onboarding complete
        const res = await fetch("/api/student/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "complete" }),
        });
        if (!res.ok) throw new Error("Failed to complete onboarding");
      }

      setCurrentStep((prev) => prev + 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleFileDrop = useCallback(
    (
      e: React.DragEvent,
      setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>
    ) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        setter({ name: file.name, type: file.type, file });
      }
    },
    []
  );

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ name: file.name, type: file.type, file });
    }
  };

  const FileDropZone = ({
    label,
    required,
    file,
    setter,
    inputRef,
  }: {
    label: string;
    required: boolean;
    file: UploadedFile | null;
    setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {file ? (
        <div className="flex items-center gap-3 p-3 glass-card">
          <FileText size={20} className="text-neon-blue" />
          <span className="text-sm text-text-secondary flex-1 truncate">
            {file.name}
          </span>
          <button
            onClick={() => setter(null)}
            className="text-text-muted hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleFileDrop(e, setter)}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-neon-blue/30 rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          <Upload
            size={24}
            className="mx-auto mb-2 text-text-muted"
          />
          <p className="text-sm text-text-muted">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-text-muted mt-1">
            PDF, JPG, PNG (max 10MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileSelect(e, setter)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < currentStep
                    ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                    : i === currentStep
                      ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                      : "bg-dark-tertiary text-text-muted border border-border"
                }`}
              >
                {i < currentStep ? (
                  <CheckCircle2 size={16} />
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-12 md:w-20 h-0.5 mx-1 transition-colors ${
                    i < currentStep
                      ? "bg-neon-green/30"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-text-muted text-center">
          Step {currentStep + 1} of {steps.length}:{" "}
          <span className="text-text-primary">{steps[currentStep]}</span>
        </p>
      </div>

      {/* Step Content */}
      <div className="glass-card p-6 md:p-8">
        {/* Step 1: Terms */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">
              Terms & Conditions
            </h2>
            <div className="max-h-64 overflow-y-auto p-4 bg-dark-primary rounded-lg text-sm text-text-secondary space-y-3 border border-border">
              <p className="text-xs text-text-muted mb-2">
                Wartens Ltd — Company registered in England and Wales | CRN: 15262249 | VAT: 473020522 | D-U-N-S&reg;: 231167762 | Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX
              </p>
              <p>
                <strong className="text-text-primary">
                  1. Company & Brand Information
                </strong>
                <br />
                Training services are provided by Wartens Ltd (CRN: 15262249, VAT: 473020522, D-U-N-S&reg;: 231167762), a company registered in England and Wales. Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX. EDWartens is a brand/trading name of Wartens Ltd.
              </p>
              <p>
                <strong className="text-text-primary">
                  2. Scope of Services
                </strong>
                <br />
                Wartens provides professional training and education including instructor-led sessions, practical training on PLC/SCADA/HMI/automation systems, learning materials, assessments, and course completion certificates. Wartens does NOT provide job placement, guaranteed employment, or guaranteed interviews. Career support is guidance-only and is not a promise of employment.
              </p>
              <p>
                <strong className="text-text-primary">
                  3. Eligibility & Enrolment
                </strong>
                <br />
                You must provide accurate and complete information during registration. Wartens may refuse admission or remove a trainee for unsafe behaviour, serious misconduct, repeated disruption, unpaid fees, or repeated rule violations.
              </p>
              <p>
                <strong className="text-text-primary">
                  4. Training Schedule & Attendance
                </strong>
                <br />
                Training is delivered according to the published schedule (BST 9:00 AM - 5:00 PM). Schedule may vary based on instructor availability, technical issues, or holidays. Students must attend on time, follow instructions, and complete tasks. Training must be completed within the stated course duration.
              </p>
              <p>
                <strong className="text-text-primary">
                  5. Assignments & Certification
                </strong>
                <br />
                Certificates are issued only if all fees are fully paid, required attendance is completed, required assignments/assessments are completed, and course standards are met. Certificates are usually issued within 30 days of completion.
              </p>
              <p>
                <strong className="text-text-primary">
                  6. Conduct & Professional Behaviour
                </strong>
                <br />
                You must behave respectfully toward trainers, other trainees, staff and visitors. During online training you must not record sessions without written permission. Trainees must handle all equipment carefully; damage caused by negligence may result in repair charges.
              </p>
              <p>
                <strong className="text-text-primary">
                  7. Fees & Payment
                </strong>
                <br />
                All fees must be paid before the course begins unless an instalment arrangement is agreed in writing. All payments must be made only to Wartens Ltd&apos;s official account.
              </p>
              <p>
                <strong className="text-text-primary">
                  8. Refund & Cancellation Policy
                </strong>
                <br />
                A trainee may request cancellation and refund within 7 calendar days of payment by submitting a written request to info@wartens.com. After 7 days, fees become non-refundable.
              </p>
              <p>
                <strong className="text-text-primary">
                  9. Career Support (No Placement Guarantee)
                </strong>
                <br />
                Wartens may provide CV suggestions, LinkedIn guidance, interview preparation tips, and job search strategies. This support is educational and advisory only. Wartens does NOT guarantee job placement, employment, any interview outcome, or any hiring decision. Employment depends entirely on candidate skill, experience, performance, and market conditions.
              </p>
              <p>
                <strong className="text-text-primary">
                  10. Intellectual Property
                </strong>
                <br />
                All training content, presentations, videos, recordings, and course materials remain the intellectual property of Wartens Ltd. You must not copy, distribute, resell, or share materials publicly.
              </p>
              <p>
                <strong className="text-text-primary">
                  11. Data Protection (UK GDPR)
                </strong>
                <br />
                Wartens collects and processes personal data for enrolment, training communication, progress tracking, certification, and lawful business operations. You may request access, correction, deletion, or restriction of your data by writing to info@wartens.com.
              </p>
              <p>
                <strong className="text-text-primary">
                  12. Limitation of Liability
                </strong>
                <br />
                Wartens does not guarantee results, skill level, certification success, or employment outcomes. Success depends on your participation and learning effort. Nothing in these Terms limits liability for death, personal injury caused by negligence, fraud, or any liability that cannot be excluded under UK law.
              </p>
              <p>
                <strong className="text-text-primary">
                  13. Governing Law
                </strong>
                <br />
                These Terms are governed by the laws of England and Wales. Any disputes will be handled exclusively in the courts of England and Wales.
              </p>
              <p className="text-xs text-text-muted mt-4">
                For the full Terms and Conditions document, please visit{" "}
                <a href="/terms" target="_blank" className="text-neon-blue hover:underline">
                  our Terms page
                </a>
                .
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border bg-dark-primary accent-neon-blue"
              />
              <span className="text-sm text-text-secondary">
                I have read and agree to the Terms & Conditions, Privacy
                Policy, and Enrollment Agreement of EDWartens UK.
              </span>
            </label>
          </div>
        )}

        {/* Step 2: Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">
              Complete Your Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Qualification{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  value={profile.qualification}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      qualification: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                >
                  <option value="">Select qualification</option>
                  <option value="GCSE">GCSE</option>
                  <option value="A-Level">A-Level</option>
                  <option value="BTEC">BTEC</option>
                  <option value="HND">HND</option>
                  <option value="Bachelors">Bachelors Degree</option>
                  <option value="Masters">Masters Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm text-text-secondary">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary resize-none"
                  placeholder="Full postal address"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Emergency Contact Name{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.emergencyName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary">
                  Emergency Contact Phone{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={profile.emergencyPhone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyPhone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">
              Upload Documents
            </h2>
            <p className="text-sm text-text-muted">
              Please upload the following documents for verification.
            </p>
            <FileDropZone
              label="ID Proof (Passport / Driving Licence)"
              required={true}
              file={idProof}
              setter={setIdProof}
              inputRef={idRef}
            />
            <FileDropZone
              label="Qualification Certificate"
              required={true}
              file={qualificationCert}
              setter={setQualificationCert}
              inputRef={qualRef}
            />
            <FileDropZone
              label="CV / Resume"
              required={false}
              file={cv}
              setter={setCv}
              inputRef={cvRef}
            />
          </div>
        )}

        {/* Step 4: Payment */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">
              Payment
            </h2>
            <div className="glass-card p-6 text-center space-y-4">
              <CreditCard
                size={40}
                className="mx-auto text-neon-blue"
              />
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  &pound;{courseFee.toLocaleString()}
                </p>
                <p className="text-sm text-text-muted">Course Fee</p>
              </div>

              {paymentStatus === "PAID" ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-full">
                  <CheckCircle2
                    size={16}
                    className="text-neon-green"
                  />
                  <span className="text-sm text-neon-green font-medium">
                    Payment Confirmed
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    {paymentStatus === "PARTIAL"
                      ? "Partial payment received. You can complete the remaining later."
                      : "Payment is pending. You can pay now or proceed and pay later."}
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          "/api/student/payment/create-session",
                          { method: "POST" }
                        );
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        }
                      } catch {
                        setError("Failed to initiate payment");
                      }
                    }}
                    className="px-6 py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors font-medium"
                  >
                    Pay with Stripe
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted text-center">
              You can skip payment for now and complete it later from the
              Payments section.
            </p>
          </div>
        )}

        {/* Step 5: Done */}
        {currentStep === 4 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
              <PartyPopper size={36} className="text-neon-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Welcome Aboard!
              </h2>
              <p className="text-text-secondary">
                Your onboarding is complete. You can now access your
                student dashboard, view sessions, and start your learning
                journey.
              </p>
            </div>
            <button
              onClick={() => router.push("/student/dashboard")}
              className="px-8 py-3 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {currentStep === 3 ? "Complete Onboarding" : "Continue"}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

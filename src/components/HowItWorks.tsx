import { MessageSquare, Users, GraduationCap, PlayCircle, Award } from "lucide-react";

const steps = [
  { icon: MessageSquare, label: "Enquiry", description: "Submit your interest through our website or call us directly." },
  { icon: Users, label: "Consultation", description: "Free one-on-one session to discuss your goals and pick the right course." },
  { icon: GraduationCap, label: "Training Week", description: "Intensive hands-on training with real PLCs and industrial tools." },
  { icon: PlayCircle, label: "Recorded Sessions", description: "15+ hours of recorded content to reinforce your learning." },
  { icon: Award, label: "Certification & Career Support", description: "CPD Accredited certificate and career support and guidance." },
];

export default function HowItWorks() {
  return (
    <section className="py-24 mesh-gradient-alt relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Your Journey in <span className="gradient-text">5 Simple Steps</span>
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative text-center">
                  <div className="glass-card rounded-xl p-6 h-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-green/20 flex items-center justify-center mx-auto mb-4 relative">
                      <Icon size={22} className="text-white" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dark-primary border border-neon-blue/40 flex items-center justify-center text-[10px] font-bold text-neon-blue">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{step.label}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

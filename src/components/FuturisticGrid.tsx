export default function FuturisticGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-neon-blue/[0.06] blur-[120px] animate-pulse-glow" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-neon-green/[0.04] blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-purple/[0.04] blur-[100px] animate-pulse-glow" style={{ animationDelay: "3s" }} />

      {/* Corner brackets */}
      <svg className="absolute top-6 left-6 w-8 h-8 text-white/[0.08]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12V2h10" />
      </svg>
      <svg className="absolute top-6 right-6 w-8 h-8 text-white/[0.08]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M30 12V2H20" />
      </svg>
      <svg className="absolute bottom-6 left-6 w-8 h-8 text-white/[0.08]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 20v10h10" />
      </svg>
      <svg className="absolute bottom-6 right-6 w-8 h-8 text-white/[0.08]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M30 20v10H20" />
      </svg>

      {/* Circuit nodes */}
      <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-neon-blue/20 animate-float" />
      <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-neon-green/20 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-[25%] left-[40%] w-2 h-2 rounded-full bg-purple/20 animate-float" style={{ animationDelay: "4s" }} />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Animated lines */}
      <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="absolute top-[70%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </div>
  );
}

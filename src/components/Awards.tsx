import Image from "next/image";

const awards = [
  { name: "UK Startup Awards 2025 - National Winner", image: "/images/Awards/UK STARTUP AWARD NATIONAL WINNER.png" },
  { name: "UK Startup Awards 2025 - Midlands Winner", image: "/images/Awards/UK STARTUP AWARD Midlands  WINNER.png" },
  { name: "Great British Entrepreneur Awards 2025 - Finalist", image: "/images/Awards/GREAT British ENtrepreneur award.png" },
  { name: "Radio Lemon Live 2025 - Best PLC Training Provider UK", image: "/images/Awards/Radio Lemon Award.png" },
  { name: "Independent Education Awards - Finalist", image: "/images/Awards/Business Awards Finalist.png" },
  { name: "Atal Award", image: "/images/Awards/Atal Award.png" },
];

const certifications = [
  "CPD Accredited", "UKRLP Registered",
];

export default function Awards() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-widest text-purple mb-3">Recognition</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Awards & <span className="gradient-text">Certifications</span>
          </h2>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {awards.map((award) => (
            <div key={award.name} className="glass-card rounded-xl p-4 flex flex-col items-center text-center group">
              <div className="w-full aspect-square relative mb-3 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center p-2">
                <Image
                  src={award.image}
                  alt={award.name}
                  width={120}
                  height={120}
                  className="object-contain max-h-full"
                />
              </div>
              <p className="text-[11px] text-text-muted leading-tight">{award.name}</p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-3">
          {certifications.map((cert) => (
            <span
              key={cert}
              className="px-4 py-2 rounded-full bg-neon-blue/5 border border-neon-blue/10 text-sm text-neon-blue/80"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

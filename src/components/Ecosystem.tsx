import Image from "next/image";

const companies = [
  { name: "Wartens", description: "Engineering & Technology", logo: "/images/wartens.webp", href: "https://wartens.com" },
  { name: "EDWartens", description: "Training Division", logo: "/images/edwartens.webp", href: "https://edwartens.com" },
  { name: "Oscabe", description: "Recruitment Services", logo: "/images/oscabe.webp", href: "https://oscabe.com" },
  { name: "roboTED", description: "Robotics & Automation", logo: "/images/roboted.webp", href: "#" },
  { name: "3BOX AI", description: "AI Solutions", logo: "/images/3box.webp", href: "#" },
  { name: "nxtED", description: "EdTech Platform", logo: "/images/nxted.webp", href: "#" },
  { name: "IUNI", description: "Global University Network", logo: "/images/iuni.webp", href: "#" },
  { name: "TraininginPLC", description: "Online PLC Courses", logo: "/images/traininginplc.webp", href: "https://traininginplc.com" },
  { name: "Oforo", description: "E-Commerce Platform", logo: "/images/oforo.webp", href: "#" },
  { name: "Seekof", description: "Job Portal", logo: "/images/seekof.webp", href: "#" },
  { name: "LADX", description: "Logistics & Delivery", logo: "/images/ladx.webp", href: "#" },
  { name: "Partshire", description: "Industrial Parts", logo: "/images/partshire.webp", href: "#" },
];

export default function Ecosystem() {
  return (
    <section className="py-24 mesh-gradient-purple relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-widest text-purple mb-3">Our Network</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            The Wartens <span className="gradient-text">Ecosystem</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A global network of companies in engineering, technology, training, and recruitment.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {companies.map((c) => (
            <a
              key={c.name}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="glass-card rounded-xl p-4 flex flex-col items-center text-center group hover:glow-blue transition-all duration-300"
            >
              <div className="h-10 flex items-center justify-center mb-3">
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={100}
                  height={40}
                  className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-text-muted">{c.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

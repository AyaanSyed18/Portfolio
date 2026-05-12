"use client";

/**
 * BentoGrid — Placeholder bento box layout.
 * Designed to be customized later. Uses glassmorphism cards
 * with subtle hover animations on a dark background.
 */

const BENTO_ITEMS = [
  {
    id: "bento-1",
    title: "Projects",
    description: "Featured work & case studies",
    span: "col-span-2 row-span-2", // large card
    gradient: "from-violet-500/10 to-fuchsia-500/10",
    iconEmoji: "🚀",
  },
  {
    id: "bento-2",
    title: "About",
    description: "Who I am",
    span: "col-span-1 row-span-1",
    gradient: "from-cyan-500/10 to-blue-500/10",
    iconEmoji: "👤",
  },
  {
    id: "bento-3",
    title: "Skills",
    description: "Tech stack & expertise",
    span: "col-span-1 row-span-1",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconEmoji: "⚡",
  },
  {
    id: "bento-4",
    title: "Contact",
    description: "Let's connect",
    span: "col-span-1 row-span-1",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconEmoji: "✉️",
  },
  {
    id: "bento-5",
    title: "Experience",
    description: "Journey so far",
    span: "col-span-2 row-span-1",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconEmoji: "📍",
  },
  {
    id: "bento-6",
    title: "Blog",
    description: "Thoughts & insights",
    span: "col-span-1 row-span-1",
    gradient: "from-indigo-500/10 to-purple-500/10",
    iconEmoji: "📝",
  },
];

export default function BentoGrid({ visible }: { visible: boolean }) {
  return (
    <section
      id="bento-section"
      className={`
        w-full min-h-screen px-6 py-20 md:px-12 lg:px-24
        transition-all duration-1000 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
      `}
    >
      {/* ── Section header ── */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90">
          Explore
        </h2>
        <p className="mt-2 text-white/40 text-lg font-light">
          Discover what I&apos;ve been building.
        </p>
      </div>

      {/* ── Bento grid ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] gap-4">
        {BENTO_ITEMS.map((item, index) => (
          <div
            key={item.id}
            id={item.id}
            className={`
              ${item.span}
              glass-card rounded-2xl p-6
              bg-gradient-to-br ${item.gradient}
              cursor-pointer group
              transition-all duration-500 ease-out
              hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: visible
                ? `fadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 100}ms forwards`
                : "none",
              opacity: 0,
            }}
          >
            {/* Icon */}
            <span className="text-3xl mb-3 block transition-transform duration-300 group-hover:scale-110">
              {item.iconEmoji}
            </span>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white/90 mb-1 tracking-tight">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/40 font-light">
              {item.description}
            </p>

            {/* Hover arrow indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-white/30"
              >
                <path
                  d="M5 15L15 5M15 5H8M15 5V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

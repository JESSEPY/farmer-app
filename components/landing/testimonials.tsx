"use client";

const testimonials = [
  {
    name: "Pedro Santos",
    location: "Mobo, Masbate",
    role: "Rice Farmer",
    quote: "Before, I struggled to find buyers for my harvest. Now I connect directly — higher income, no middleman.",
  },
  {
    name: "Rosa Reyes",
    location: "Milagros, Masbate",
    role: "Vegetable Farmer",
    quote: "I track my crops using the app. I know when to water, when to harvest. This is a big help.",
    featured: true,
  },
  {
    name: "Jun Alvarez",
    location: "Aroroy, Masbate",
    role: "Corn Farmer",
    quote: "The weather forecasts and AI advice saved my crops during the typhoon. I'm no longer blind to the weather.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#3e2723] dark:text-[#f0ebe5] mb-4">
          Trusted by Farmers
        </h2>
        <p className="text-center text-[#6d4c41] dark:text-[#d7cfc4] mb-12 max-w-2xl mx-auto">
          Real stories from farmers in Masbate
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${
                t.featured
                  ? "bg-[#2e7d32]/5 dark:bg-[#4caf50]/10 border-[#2e7d32]/20 dark:border-[#4caf50]/30"
                  : "bg-card border-[#e0d6c9] dark:border-[#3e4a3d]"
              }`}
            >
              {/* Avatar placeholder */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                  t.featured
                    ? "bg-[#2e7d32] text-white dark:bg-[#4caf50] dark:text-[#0a1f0c]"
                    : "bg-[#c8e6c9] text-[#1b5e20] dark:bg-[#388e3c] dark:text-[#f0ebe5]"
                }`}>
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-sm text-[#3e2723] dark:text-[#f0ebe5]">{t.name}</p>
                  <p className="text-xs text-[#6d4c41] dark:text-[#d7cfc4]">{t.role} · {t.location}</p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm text-[#6d4c41] dark:text-[#d7cfc4] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

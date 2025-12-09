import { ClipboardList, Target, Rocket } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us about your child",
    description: "Age, personality, interests — the basics.",
  },
  {
    icon: Target,
    title: "Get your Readiness Score",
    description: "Plus a personalized instrument recommendation.",
  },
  {
    icon: Rocket,
    title: "First-week action plan",
    description: "Concrete next steps to set them up for success.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          How It Works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number connector (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Icon */}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg mb-6 transition-transform group-hover:scale-110">
                <step.icon className="h-9 w-9 text-primary-foreground" />
              </div>

              {/* Step number */}
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Step {index + 1}
              </span>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

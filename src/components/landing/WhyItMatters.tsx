import { HelpCircle, CheckCircle } from "lucide-react";

const questions = [
  "Is my kid old enough?",
  "Which instrument should we start with?",
  "Will they even practice?",
];

const benefits = [
  "Designed by real music teachers with years of experience",
  "Tailored recommendations based on your child's personality",
  "Clear, actionable steps to make learning music awesome!",
];

export function WhyItMatters() {
  return (
    <section className="py-16 px-4 gradient-hero">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
          Why It Matters
        </h2>

        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          {/* Parent questions */}
          <div>
            <p className="text-foreground font-medium mb-4">
              Parents often wonder:
            </p>
            <ul className="space-y-3">
              {questions.map((question, index) => (
                <li key={index} className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Benefits */}
          <div>
            <p className="text-foreground font-medium mb-4">
              This quiz helps reduce the guesswork:
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

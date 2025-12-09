import { Submission } from "@/lib/scoring";
import { CheckCircle2, Lightbulb } from "lucide-react";

interface ActionPlanProps {
  submission: Submission;
}

export function ActionPlan({ submission }: ActionPlanProps) {
  const { actionPlan, childName } = submission;

  return (
    <div 
      className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50 animate-slide-up"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <Lightbulb className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">First-Week Action Plan</h2>
          <p className="text-sm text-muted-foreground">Personalized steps for {childName}</p>
        </div>
      </div>

      {/* Checklist */}
      <ul className="space-y-4">
        {actionPlan.map((item, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success mt-0.5 group-hover:bg-success group-hover:text-primary-foreground transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="text-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

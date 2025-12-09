import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  children: ReactNode;
  className?: string;
}

export function QuizCard({ children, className }: QuizCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-6 shadow-card animate-fade-in",
        "border border-border/50",
        className
      )}
    >
      {children}
    </div>
  );
}

interface QuizCardTitleProps {
  children: ReactNode;
  subtitle?: string;
}

export function QuizCardTitle({ children, subtitle }: QuizCardTitleProps) {
  return (
    <div className="mb-6 space-y-2">
      <h3 className="text-xl font-bold text-foreground leading-tight">
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

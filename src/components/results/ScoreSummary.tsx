import { Submission } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Star, TrendingUp, Sparkles } from "lucide-react";

interface ScoreSummaryProps {
  submission: Submission;
}

export function ScoreSummary({ submission }: ScoreSummaryProps) {
  const { score, band, bandLabel, bandDescription, childName } = submission;

  const getBandStyles = () => {
    switch (band) {
      case 'emerging':
        return {
          gradient: 'from-amber-400 to-orange-500',
          bgGlow: 'bg-amber-500/20',
          textColor: 'text-amber-600',
          icon: Star,
        };
      case 'ready-with-support':
        return {
          gradient: 'from-cyan-400 to-blue-500',
          bgGlow: 'bg-blue-500/20',
          textColor: 'text-blue-600',
          icon: TrendingUp,
        };
      case 'ready-to-thrive':
        return {
          gradient: 'from-emerald-400 to-teal-500',
          bgGlow: 'bg-emerald-500/20',
          textColor: 'text-emerald-600',
          icon: Sparkles,
        };
    }
  };

  const styles = getBandStyles();
  const Icon = styles.icon;

  return (
    <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50 animate-slide-up">
      {/* Score display */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {childName}'s Music Readiness Score
        </p>
        
        <div className="relative inline-flex items-center justify-center">
          <div className={cn("absolute inset-0 rounded-full blur-2xl", styles.bgGlow)} />
          <div className={cn(
            "relative flex items-baseline gap-1 bg-gradient-to-r bg-clip-text text-transparent",
            styles.gradient
          )}>
            <span className="text-7xl sm:text-8xl font-bold">{score}</span>
            <span className="text-2xl sm:text-3xl font-semibold">/100</span>
          </div>
        </div>
      </div>

      {/* Band badge */}
      <div className="flex justify-center mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-gradient-to-r text-primary-foreground font-semibold",
          styles.gradient
        )}>
          <Icon className="h-4 w-4" />
          {bandLabel}
        </div>
      </div>

      {/* Description */}
      <p className="text-center text-muted-foreground leading-relaxed">
        {bandDescription}
      </p>
    </div>
  );
}

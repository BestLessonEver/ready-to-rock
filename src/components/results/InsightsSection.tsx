import { Submission } from "@/lib/scoring";
import { Sparkles, Music, Brain, Star, Lightbulb, Zap } from "lucide-react";

interface InsightsSectionProps {
  submission: Submission;
}

export function InsightsSection({ submission }: InsightsSectionProps) {
  // Use pre-generated insights from submission - no API call needed
  const insights = submission.insights;

  // Don't render if no insights available
  if (!insights) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Meet {submission.childName}'s Musical Profile
        </h2>
      </div>

      {/* Musical Superpower Badge */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Musical Superpower</p>
          <p className="text-lg font-bold text-foreground">{insights.superpower}</p>
        </div>
      </div>

      {/* Profile Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Profile Type</h3>
        </div>
        <p className="text-muted-foreground pl-6">{insights.profileType}</p>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Top Musical Strengths</h3>
        </div>
        <ul className="space-y-2 pl-6">
          {insights.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-primary mt-1.5">•</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Learning Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">How {submission.childName} Learns Best</h3>
        </div>
        <p className="text-muted-foreground pl-6">{insights.learningStyle}</p>
      </div>

      {/* Performer Profile */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Performer Profile</h3>
        </div>
        <p className="text-muted-foreground pl-6">{insights.performerType}</p>
      </div>

      {/* Instrument Reasoning */}
      <div className="space-y-2 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">
            Why {submission.primaryInstrument} Fits {submission.childName}
          </h3>
        </div>
        <p className="text-muted-foreground pl-6">{insights.instrumentReasoning}</p>
      </div>
    </div>
  );
}

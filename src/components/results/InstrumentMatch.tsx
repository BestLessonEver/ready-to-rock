import { Submission } from "@/lib/scoring";
import { Music2, Award } from "lucide-react";

interface InstrumentMatchProps {
  submission: Submission;
}

const instrumentInfo: Record<string, { emoji: string; description: string }> = {
  Piano: {
    emoji: "🎹",
    description: "builds coordination, musical understanding, and confidence quickly",
  },
  Guitar: {
    emoji: "🎸",
    description: "great for building finger strength and learning chords for sing-alongs",
  },
  Drums: {
    emoji: "🥁",
    description: "perfect for high-energy learners who love rhythm and movement",
  },
  Voice: {
    emoji: "🎤",
    description: "ideal for expressive kids who love singing along to their favorite songs",
  },
  Ukulele: {
    emoji: "🪕",
    description: "small and approachable, perfect for younger hands and quick wins",
  },
};

export function InstrumentMatch({ submission }: InstrumentMatchProps) {
  const { primaryInstrument, secondaryInstruments, childName, hummingSinging, rhythmPlay, dancing, emotionalResponse } = submission;
  const info = instrumentInfo[primaryInstrument] || instrumentInfo.Piano;

  // Build personalized explanation based on new quiz fields
  const getInterestText = () => {
    if (hummingSinging === 'all-the-time') return 'love for singing and making music';
    if (rhythmPlay === 'constantly') return 'natural sense of rhythm';
    if (dancing === 'yes') return 'love for moving to music';
    if (emotionalResponse === 'yes') return 'deep connection to music';
    return 'musical potential';
  };

  return (
    <div 
      className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50 animate-slide-up"
      style={{ animationDelay: '0.1s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <Music2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Best-Fit Instrument</h2>
          <p className="text-sm text-muted-foreground">Based on {childName}'s profile</p>
        </div>
      </div>

      {/* Primary instrument */}
      <div className="bg-primary/5 rounded-xl p-5 mb-4 border border-primary/10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{info.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Top Pick
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{primaryInstrument}</h3>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Based on {childName}'s age, energy level, and {getInterestText()}, {primaryInstrument.toLowerCase()} {info.description}.
        </p>
      </div>

      {/* Secondary instruments */}
      {secondaryInstruments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Also a great fit:
          </p>
          <div className="flex flex-wrap gap-2">
            {secondaryInstruments.map((instrument) => (
              <span
                key={instrument}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
              >
                <span>{instrumentInfo[instrument]?.emoji || "🎵"}</span>
                {instrument}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

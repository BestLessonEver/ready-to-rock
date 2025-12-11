import { useEffect, useState } from "react";
import { Submission } from "@/lib/scoring";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Music, Brain, Star, Lightbulb, Zap } from "lucide-react";
import { toast } from "sonner";

interface Insights {
  profileType: string;
  strengths: string[];
  learningStyle: string;
  performerType: string;
  instrumentReasoning: string;
  superpower: string;
}

interface InsightsSectionProps {
  submission: Submission;
}

export function InsightsSection({ submission }: InsightsSectionProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          childName: submission.childName,
          score: submission.score,
          band: submission.band,
          bandLabel: submission.bandLabel,
          primaryInstrument: submission.primaryInstrument,
          secondaryInstruments: submission.secondaryInstruments,
          instrumentsAtHome: submission.instrumentsAtHome,
          pitch: submission.pitch,
          rhythm: submission.rhythm,
          memory: submission.memory,
          emotionalResponse: submission.emotionalResponse,
          hummingSinging: submission.hummingSinging,
          rhythmPlay: submission.rhythmPlay,
          dancing: submission.dancing,
          drawnToInstruments: submission.drawnToInstruments,
          performerStyle: submission.performerStyle,
          focusDuration: submission.focusDuration,
          wantsToLearn: submission.wantsToLearn,
        };

        const { data, error: fnError } = await supabase.functions.invoke('generate-insights', {
          body: payload,
        });

        if (fnError) {
          console.error('Error fetching insights:', fnError);
          throw new Error(fnError.message || 'Failed to generate insights');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.insights) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error('Error generating insights:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
        toast.error('Unable to generate personalized insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [submission]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-xl font-bold text-foreground">Generating Musical Profile...</h2>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return null; // Don't show section if there's an error
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

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSubmission } from "@/lib/storage";
import { Submission } from "@/lib/scoring";
import { ScoreSummary } from "@/components/results/ScoreSummary";
import { InstrumentMatch } from "@/components/results/InstrumentMatch";
import { ActionPlan } from "@/components/results/ActionPlan";
import { BookingCTA } from "@/components/results/BookingCTA";
import { EmailNotice } from "@/components/results/EmailNotice";
import { Footer } from "@/components/landing/Footer";
import { Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getSubmission(id);
      setSubmission(data);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Music className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Results Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find these results. They may have expired or the link is incorrect.
          </p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Take the Quiz Again
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 px-4 border-b border-border bg-card">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">Music Readiness Score</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 gradient-hero">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Email confirmation notice */}
          <EmailNotice email={submission.email} />

          {/* Score Summary */}
          <ScoreSummary submission={submission} />

          {/* Instrument Match */}
          <InstrumentMatch submission={submission} />

          {/* Action Plan */}
          <ActionPlan submission={submission} />

          {/* Booking CTA */}
          <BookingCTA />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ResultsPage;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Loader2 } from "lucide-react";

// Sample submission data matching the edge function format
const sampleSubmissionData = {
  childName: "Emma",
  parentName: "Sarah Johnson",
  score: 78,
  band: "ready-to-thrive",
  bandLabel: "Ready to Thrive",
  bandDescription: "Emma shows excellent musical readiness! She's likely to thrive with the right teacher and instrument match.",
  primaryInstrument: "Piano",
  secondaryInstruments: ["Guitar", "Voice"],
  answers: {
    pitch: "yes-on-tune",
    rhythm: "yes",
    memory: "yes",
    emotionalResponse: "yes",
    hummingSinging: "all-the-time",
    rhythmPlay: "constantly",
    dancing: "yes",
    drawnToInstruments: "yes",
    performerStyle: "loves-showing",
    focusDuration: "20-plus",
    wantsToLearn: "yes",
    instrumentsAtHome: ["keyboard-piano"],
  },
};

export default function EmailPreview() {
  const [view, setView] = useState<"lead" | "parent">("parent");
  const [emailHtml, setEmailHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [actionPlan, setActionPlan] = useState<string[]>([]);

  const generateActionPlan = async () => {
    console.log("Generating AI action plan...");
    const { data, error } = await supabase.functions.invoke("generate-action-plan", {
      body: sampleSubmissionData,
    });

    if (error) {
      console.error("Error generating action plan:", error);
      return null;
    }

    console.log("AI action plan generated:", data.actionPlan);
    return data.actionPlan as string[];
  };

  const fetchEmailHtml = async (type: "lead" | "parent", plan?: string[]) => {
    const planToUse = plan || actionPlan;
    
    console.log("Fetching email HTML for type:", type);
    const { data, error } = await supabase.functions.invoke("send-quiz-emails", {
      body: {
        preview: true,
        type,
        sampleOverride: planToUse.length > 0 ? { actionPlan: planToUse } : undefined,
      },
    });

    if (error) {
      console.error("Error fetching email HTML:", error);
      return;
    }

    setEmailHtml(data.html);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const newPlan = await generateActionPlan();
    if (newPlan) {
      setActionPlan(newPlan);
      await fetchEmailHtml(view, newPlan);
    }
    setRegenerating(false);
  };

  // Initial load: generate action plan and fetch email
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const plan = await generateActionPlan();
      if (plan) {
        setActionPlan(plan);
        await fetchEmailHtml("parent", plan);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch email when view changes
  useEffect(() => {
    if (!loading && actionPlan.length > 0) {
      fetchEmailHtml(view);
    }
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating AI action plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-xl font-semibold text-foreground">Email Preview</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate Plan
            </Button>
            <Button
              variant={view === "parent" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("parent")}
            >
              Parent Email
            </Button>
            <Button
              variant={view === "lead" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("lead")}
            >
              Lead Email
            </Button>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: emailHtml }}
        />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Edit templates in{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded">
            supabase/functions/send-quiz-emails/index.ts
          </code>
          <br />
          Edit AI prompts in{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded">
            supabase/functions/generate-action-plan/index.ts
          </code>
        </p>
      </div>
    </div>
  );
}

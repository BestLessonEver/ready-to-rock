import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";
import { QuizCard, QuizCardTitle } from "./QuizCard";
import { OptionButton } from "./OptionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizAnswers, createSubmission, getActionPlanContext, Submission, Insights } from "@/lib/scoring";
import { saveSubmission, saveSubmissionToDb, savePartialSubmission, updateSubmissionToComplete } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const TOTAL_STEPS = 15;

const initialAnswers: QuizAnswers = {
  parentName: "",
  email: "",
  childName: "",
  childAge: "",
  phone: "",
  pitch: "",
  rhythm: "",
  memory: "",
  emotionalResponse: "",
  hummingSinging: "",
  rhythmPlay: "",
  dancing: "",
  drawnToInstruments: "",
  performerStyle: "",
  focusDuration: "",
  wantsToLearn: "",
  instrumentsAtHome: [],
};

export function QuizForm() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const partialSubmissionId = useRef<string | null>(null);
  const navigate = useNavigate();

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const selectAndAdvance = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    updateAnswer(key, value);
    setTimeout(() => {
      setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }, 300);
  };

  const toggleArrayItem = (key: 'instrumentsAtHome', item: string) => {
    setAnswers(prev => {
      const current = prev[key];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return answers.parentName.trim() !== "";
      case 2: return answers.pitch !== "";
      case 3: return answers.rhythm !== "";
      case 4: return answers.memory !== "";
      case 5: return answers.emotionalResponse !== "";
      case 6: return answers.email.trim() !== "" && validateEmail(answers.email);
      case 7: return answers.hummingSinging !== "";
      case 8: return answers.rhythmPlay !== "";
      case 9: return answers.dancing !== "";
      case 10: return answers.drawnToInstruments !== "";
      case 11: return answers.performerStyle !== "";
      case 12: return answers.focusDuration !== "";
      case 13: return answers.wantsToLearn !== "";
      case 14: return answers.instrumentsAtHome.length > 0;
      case 15: return answers.childName.trim() !== "" && answers.childAge !== "";
      default: return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const sendQuizEmails = async (submission: Submission) => {
    try {
      console.log("Sending quiz emails...");
      const { error } = await supabase.functions.invoke("send-quiz-emails", {
        body: submission,
      });
      if (error) {
        console.error("Error sending emails:", error);
      } else {
        console.log("Emails sent successfully");
      }
    } catch (err) {
      console.error("Failed to send emails:", err);
    }
  };

  const generateAIActionPlan = async (submission: Submission): Promise<string[] | null> => {
    try {
      const context = getActionPlanContext(submission);
      console.log("Sending to AI action plan:", JSON.stringify(context));
      
      const { data, error } = await supabase.functions.invoke("generate-action-plan", {
        body: context,
      });
      
      if (error) {
        console.error("Edge function error:", error);
        return null;
      }
      
      if (data?.error) {
        console.error("AI generation error:", data.error);
        return null;
      }
      
      if (data?.actionPlan && Array.isArray(data.actionPlan)) {
        console.log("AI action plan generated:", data.actionPlan);
        return data.actionPlan;
      }
      
      console.warn("Unexpected AI response format:", data);
      return null;
    } catch (err) {
      console.error("Failed to call AI edge function:", err);
      return null;
    }
  };

  const generateAIInsights = async (submission: Submission): Promise<Insights | null> => {
    try {
      const payload = {
        childName: submission.childName,
        score: submission.score,
        band: submission.band,
        bandLabel: submission.bandLabel,
        primaryInstrument: submission.primaryInstrument,
        secondaryInstruments: submission.secondaryInstruments,
        instrumentsAtHome: submission.instrumentsAtHome,
        childAge: submission.childAge,
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

      console.log("Generating AI insights...");
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: payload,
      });

      if (error) {
        console.error("Insights edge function error:", error);
        return null;
      }

      if (data?.error) {
        console.error("AI insights error:", data.error);
        return null;
      }

      if (data?.insights) {
        console.log("AI insights generated:", data.insights);
        return data.insights;
      }

      console.warn("Unexpected insights response format:", data);
      return null;
    } catch (err) {
      console.error("Failed to generate insights:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (answers.childName.trim() === "") {
      setErrors({ childName: "Please enter your child's name" });
      return;
    }

    setIsSubmitting(true);
    
    // Create initial submission with fallback action plan
    const submission = createSubmission(answers);
    
    // If we have a partial submission, use that ID
    if (partialSubmissionId.current) {
      submission.id = partialSubmissionId.current;
    }
    
    // Try to get AI-generated action plan and insights in parallel
    const [aiActionPlan, aiInsights] = await Promise.all([
      generateAIActionPlan(submission),
      generateAIInsights(submission),
    ]);
    
    if (aiActionPlan) {
      submission.actionPlan = aiActionPlan;
    }
    
    if (aiInsights) {
      submission.insights = aiInsights;
    }
    
    // Save to localStorage for immediate access
    saveSubmission(submission);
    
    // Save to database - update if partial exists, otherwise create new
    if (partialSubmissionId.current) {
      updateSubmissionToComplete(partialSubmissionId.current, submission);
    } else {
      saveSubmissionToDb(submission);
    }
    
    // Fire-and-forget: send emails without blocking navigation
    sendQuizEmails(submission);
    
    navigate(`/results/${submission.id}`);
  };

  const nextStep = async () => {
    if (step === 6 && !validateEmail(answers.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    // Save partial submission when leaving step 6 (email capture)
    if (step === 6 && canProceed() && !partialSubmissionId.current) {
      const id = await savePartialSubmission({
        parentName: answers.parentName,
        email: answers.email,
        lastStep: 6,
      });
      if (id) {
        partialSubmissionId.current = id;
      }
    }
    
    if (step < TOTAL_STEPS && canProceed()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <div>
        {/* Screen 1: Parent Name */}
        {step === 1 && (
          <QuizCard key="step1">
            <QuizCardTitle>
              What's your name?
            </QuizCardTitle>
            <div className="space-y-2">
              
              <Input
                id="parentName"
                placeholder="Enter your name"
                value={answers.parentName}
                onChange={e => updateAnswer("parentName", e.target.value)}
                className="h-12"
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 2: Pitch */}
        {step === 2 && (
          <QuizCard key="step2">
            <QuizCardTitle subtitle="Musical Aptitude">
              When your child sings, do they usually stay close to the melody?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes, mostly in tune"
                selected={answers.pitch === "yes-on-tune"}
                onClick={() => selectAndAdvance("pitch", "yes-on-tune")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.pitch === "sometimes"}
                onClick={() => selectAndAdvance("pitch", "sometimes")}
              />
              <OptionButton
                label="Not really, but they love singing"
                selected={answers.pitch === "not-really"}
                onClick={() => selectAndAdvance("pitch", "not-really")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 3: Rhythm */}
        {step === 3 && (
          <QuizCard key="step3">
            <QuizCardTitle subtitle="Musical Aptitude">
              Can your child keep a steady beat for about 10 seconds?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.rhythm === "yes"}
                onClick={() => selectAndAdvance("rhythm", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.rhythm === "sometimes"}
                onClick={() => selectAndAdvance("rhythm", "sometimes")}
              />
              <OptionButton
                label="Not yet"
                selected={answers.rhythm === "not-yet"}
                onClick={() => selectAndAdvance("rhythm", "not-yet")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 4: Memory */}
        {step === 4 && (
          <QuizCard key="step4">
            <QuizCardTitle subtitle="Musical Aptitude">
              Does your child remember a song easily after hearing it only a few times?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.memory === "yes"}
                onClick={() => selectAndAdvance("memory", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.memory === "sometimes"}
                onClick={() => selectAndAdvance("memory", "sometimes")}
              />
              <OptionButton
                label="Not really"
                selected={answers.memory === "not-really"}
                onClick={() => selectAndAdvance("memory", "not-really")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 5: Emotional Response */}
        {step === 5 && (
          <QuizCard key="step5">
            <QuizCardTitle subtitle="Musical Aptitude">
              Does your child react emotionally when they hear music?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.emotionalResponse === "yes"}
                onClick={() => selectAndAdvance("emotionalResponse", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.emotionalResponse === "sometimes"}
                onClick={() => selectAndAdvance("emotionalResponse", "sometimes")}
              />
              <OptionButton
                label="Not that I've noticed"
                selected={answers.emotionalResponse === "not-noticed"}
                onClick={() => selectAndAdvance("emotionalResponse", "not-noticed")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 6: Email Capture */}
        {step === 6 && (
          <QuizCard key="step6">
            <QuizCardTitle subtitle="Save Your Progress">
              Okay {answers.parentName}, enter your email so we can send you your child's Music Readiness Score and Action Plan when you finish.
            </QuizCardTitle>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={answers.email}
                onChange={e => updateAnswer("email", e.target.value)}
                className="h-12"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </QuizCard>
        )}

        {/* Screen 7: Humming/Singing */}
        {step === 7 && (
          <QuizCard key="step7">
            <QuizCardTitle subtitle="Musical Behaviors">
              Does your child hum, sing, or make up their own songs during the day?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="All the time"
                selected={answers.hummingSinging === "all-the-time"}
                onClick={() => selectAndAdvance("hummingSinging", "all-the-time")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.hummingSinging === "sometimes"}
                onClick={() => selectAndAdvance("hummingSinging", "sometimes")}
              />
              <OptionButton
                label="Rarely"
                selected={answers.hummingSinging === "rarely"}
                onClick={() => selectAndAdvance("hummingSinging", "rarely")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 8: Rhythm Play */}
        {step === 8 && (
          <QuizCard key="step8">
            <QuizCardTitle subtitle="Musical Behaviors">
              Does your child tap on tables, beatbox, or create rhythms with objects?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Constantly"
                selected={answers.rhythmPlay === "constantly"}
                onClick={() => selectAndAdvance("rhythmPlay", "constantly")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.rhythmPlay === "sometimes"}
                onClick={() => selectAndAdvance("rhythmPlay", "sometimes")}
              />
              <OptionButton
                label="Rarely"
                selected={answers.rhythmPlay === "rarely"}
                onClick={() => selectAndAdvance("rhythmPlay", "rarely")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 9: Dancing */}
        {step === 9 && (
          <QuizCard key="step9">
            <QuizCardTitle subtitle="Musical Behaviors">
              Does your child start dancing when music comes on?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.dancing === "yes"}
                onClick={() => selectAndAdvance("dancing", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.dancing === "sometimes"}
                onClick={() => selectAndAdvance("dancing", "sometimes")}
              />
              <OptionButton
                label="No"
                selected={answers.dancing === "no"}
                onClick={() => selectAndAdvance("dancing", "no")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 10: Drawn to Instruments */}
        {step === 10 && (
          <QuizCard key="step10">
            <QuizCardTitle subtitle="Musical Behaviors">
              When your child sees musical instruments in public places, do they want to touch or explore them?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.drawnToInstruments === "yes"}
                onClick={() => selectAndAdvance("drawnToInstruments", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.drawnToInstruments === "sometimes"}
                onClick={() => selectAndAdvance("drawnToInstruments", "sometimes")}
              />
              <OptionButton
                label="Not really"
                selected={answers.drawnToInstruments === "not-really"}
                onClick={() => selectAndAdvance("drawnToInstruments", "not-really")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 11: Performer Style */}
        {step === 11 && (
          <QuizCard key="step11">
            <QuizCardTitle subtitle="Personality">
              How does your child feel about performing in front of others?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Loves showing off"
                selected={answers.performerStyle === "loves-showing"}
                onClick={() => selectAndAdvance("performerStyle", "loves-showing")}
              />
              <OptionButton
                label="A little shy but still tries"
                selected={answers.performerStyle === "shy-but-tries"}
                onClick={() => selectAndAdvance("performerStyle", "shy-but-tries")}
              />
              <OptionButton
                label="Very nervous / prefers privacy"
                selected={answers.performerStyle === "nervous"}
                onClick={() => selectAndAdvance("performerStyle", "nervous")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 12: Focus Duration */}
        {step === 12 && (
          <QuizCard key="step12">
            <QuizCardTitle subtitle="Personality">
              How long can your child focus on something they enjoy?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="20+ minutes"
                selected={answers.focusDuration === "20-plus"}
                onClick={() => selectAndAdvance("focusDuration", "20-plus")}
              />
              <OptionButton
                label="10–20 minutes"
                selected={answers.focusDuration === "10-20"}
                onClick={() => selectAndAdvance("focusDuration", "10-20")}
              />
              <OptionButton
                label="5–10 minutes"
                selected={answers.focusDuration === "5-10"}
                onClick={() => selectAndAdvance("focusDuration", "5-10")}
              />
              <OptionButton
                label="Under 5 minutes"
                selected={answers.focusDuration === "under-5"}
                onClick={() => selectAndAdvance("focusDuration", "under-5")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 13: Wants to Learn */}
        {step === 13 && (
          <QuizCard key="step13">
            <QuizCardTitle subtitle="Motivation">
              Has your child ever said they want to learn an instrument?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.wantsToLearn === "yes"}
                onClick={() => selectAndAdvance("wantsToLearn", "yes")}
              />
              <OptionButton
                label="No"
                selected={answers.wantsToLearn === "no"}
                onClick={() => selectAndAdvance("wantsToLearn", "no")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 14: Instruments at Home */}
        {step === 14 && (
          <QuizCard key="step14">
            <QuizCardTitle subtitle="Environment">
              Do you have any instruments at home?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Piano"
                selected={answers.instrumentsAtHome.includes("keyboard-piano")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "keyboard-piano")}
                multiSelect
              />
              <OptionButton
                label="Guitar / Ukulele"
                selected={answers.instrumentsAtHome.includes("guitar-ukulele")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "guitar-ukulele")}
                multiSelect
              />
              <OptionButton
                label="Drums"
                selected={answers.instrumentsAtHome.includes("drums")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "drums")}
                multiSelect
              />
              <OptionButton
                label="Other"
                selected={answers.instrumentsAtHome.includes("other")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "other")}
                multiSelect
              />
              <OptionButton
                label="Not yet"
                selected={answers.instrumentsAtHome.includes("not-yet")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "not-yet")}
                multiSelect
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 15: Final Lead Capture */}
        {step === 15 && (
          <QuizCard key="step15">
            <QuizCardTitle subtitle="Almost Done!">
              What's your child's name and age?
            </QuizCardTitle>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="childName">Child's first name</Label>
                <Input
                  id="childName"
                  placeholder="Enter their name"
                  value={answers.childName}
                  onChange={e => updateAnswer("childName", e.target.value)}
                  className="h-12"
                />
                {errors.childName && (
                  <p className="text-sm text-destructive">{errors.childName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge">Child's age</Label>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton
                    label="4-5 years"
                    selected={answers.childAge === "4-5"}
                    onClick={() => updateAnswer("childAge", "4-5")}
                  />
                  <OptionButton
                    label="6-7 years"
                    selected={answers.childAge === "6-7"}
                    onClick={() => updateAnswer("childAge", "6-7")}
                  />
                  <OptionButton
                    label="8-9 years"
                    selected={answers.childAge === "8-9"}
                    onClick={() => updateAnswer("childAge", "8-9")}
                  />
                  <OptionButton
                    label="10-11 years"
                    selected={answers.childAge === "10-11"}
                    onClick={() => updateAnswer("childAge", "10-11")}
                  />
                  <OptionButton
                    label="12+ years"
                    selected={answers.childAge === "12-plus"}
                    onClick={() => updateAnswer("childAge", "12-plus")}
                    className="col-span-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Your phone number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={answers.phone}
                  onChange={e => updateAnswer("phone", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </QuizCard>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              "See My Child's Results"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

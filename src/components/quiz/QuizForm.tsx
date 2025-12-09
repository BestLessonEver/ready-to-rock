import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";
import { QuizCard, QuizCardTitle } from "./QuizCard";
import { OptionButton } from "./OptionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizAnswers, createSubmission } from "@/lib/scoring";
import { saveSubmission } from "@/lib/storage";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const TOTAL_STEPS = 17;

const initialAnswers: QuizAnswers = {
  parentName: "",
  email: "",
  childName: "",
  phone: "",
  pitch: "",
  rhythm: "",
  memory: "",
  emotionalResponse: "",
  hummingSinging: "",
  rhythmPlay: "",
  dancing: "",
  drawnToInstruments: "",
  handlesCorrection: "",
  performerStyle: "",
  focusDuration: "",
  wantsToLearn: "",
  favoriteSongBehavior: "",
  instrumentsAtHome: [],
};

export function QuizForm() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      case 11: return answers.handlesCorrection !== "";
      case 12: return answers.performerStyle !== "";
      case 13: return answers.focusDuration !== "";
      case 14: return answers.wantsToLearn !== "";
      case 15: return answers.favoriteSongBehavior !== "";
      case 16: return answers.instrumentsAtHome.length > 0;
      case 17: return answers.childName.trim() !== "";
      default: return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (answers.childName.trim() === "") {
      setErrors({ childName: "Please enter your child's name" });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const submission = createSubmission(answers);
    saveSubmission(submission);
    
    navigate(`/results/${submission.id}`);
  };

  const nextStep = () => {
    if (step === 6 && !validateEmail(answers.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
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

      <div className="min-h-[400px]">
        {/* Screen 1: Parent Name */}
        {step === 1 && (
          <QuizCard key="step1">
            <QuizCardTitle subtitle="Let's get started">
              What's your name?
            </QuizCardTitle>
            <div className="space-y-2">
              <Label htmlFor="parentName">Your first name</Label>
              <Input
                id="parentName"
                placeholder="Enter your name"
                value={answers.parentName}
                onChange={e => updateAnswer("parentName", e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 2: Pitch */}
        {step === 2 && (
          <QuizCard key="step2">
            <QuizCardTitle subtitle="Musical aptitude">
              When your child sings, do they usually stay close to the melody?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes, mostly on tune"
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
            <QuizCardTitle subtitle="Musical aptitude">
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
            <QuizCardTitle subtitle="Musical aptitude">
              Does your child remember songs easily after hearing them a few times?
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
            <QuizCardTitle subtitle="Musical aptitude">
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
            <QuizCardTitle subtitle="Save your progress">
              Okay {answers.parentName}, enter your email so we can send you your child's final Music Readiness Score when you finish.
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
            <QuizCardTitle subtitle="Musical behaviors">
              Does your child hum, sing, or make up little tunes during the day?
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
            <QuizCardTitle subtitle="Musical behaviors">
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
            <QuizCardTitle subtitle="Musical behaviors">
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
            <QuizCardTitle subtitle="Musical behaviors">
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

        {/* Screen 11: Handles Correction */}
        {step === 11 && (
          <QuizCard key="step11">
            <QuizCardTitle subtitle="Personality">
              How does your child handle trying something new?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Jumps right in and experiments"
                selected={answers.handlesCorrection === "jumps-in"}
                onClick={() => selectAndAdvance("handlesCorrection", "jumps-in")}
              />
              <OptionButton
                label="Tries but needs encouragement"
                selected={answers.handlesCorrection === "needs-encouragement"}
                onClick={() => selectAndAdvance("handlesCorrection", "needs-encouragement")}
              />
              <OptionButton
                label="Gets frustrated easily"
                selected={answers.handlesCorrection === "frustrated"}
                onClick={() => selectAndAdvance("handlesCorrection", "frustrated")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 12: Performer Style */}
        {step === 12 && (
          <QuizCard key="step12">
            <QuizCardTitle subtitle="Personality">
              How does your child feel about performing or showing what they learned?
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

        {/* Screen 13: Focus Duration */}
        {step === 13 && (
          <QuizCard key="step13">
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

        {/* Screen 14: Wants to Learn */}
        {step === 14 && (
          <QuizCard key="step14">
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
                label="Not yet"
                selected={answers.wantsToLearn === "not-yet"}
                onClick={() => selectAndAdvance("wantsToLearn", "not-yet")}
              />
              <OptionButton
                label="No"
                selected={answers.wantsToLearn === "no"}
                onClick={() => selectAndAdvance("wantsToLearn", "no")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 15: Favorite Song Behavior */}
        {step === 15 && (
          <QuizCard key="step15">
            <QuizCardTitle subtitle="Motivation">
              Does your child ask you to replay songs they love?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Yes"
                selected={answers.favoriteSongBehavior === "yes"}
                onClick={() => selectAndAdvance("favoriteSongBehavior", "yes")}
              />
              <OptionButton
                label="Sometimes"
                selected={answers.favoriteSongBehavior === "sometimes"}
                onClick={() => selectAndAdvance("favoriteSongBehavior", "sometimes")}
              />
              <OptionButton
                label="Rarely"
                selected={answers.favoriteSongBehavior === "rarely"}
                onClick={() => selectAndAdvance("favoriteSongBehavior", "rarely")}
              />
            </div>
          </QuizCard>
        )}

        {/* Screen 16: Instruments at Home */}
        {step === 16 && (
          <QuizCard key="step16">
            <QuizCardTitle subtitle="Environment">
              Do you have any instruments at home?
            </QuizCardTitle>
            <div className="space-y-2">
              <OptionButton
                label="Keyboard or piano"
                selected={answers.instrumentsAtHome.includes("keyboard-piano")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "keyboard-piano")}
                multiSelect
              />
              <OptionButton
                label="Guitar or ukulele"
                selected={answers.instrumentsAtHome.includes("guitar-ukulele")}
                onClick={() => toggleArrayItem("instrumentsAtHome", "guitar-ukulele")}
                multiSelect
              />
              <OptionButton
                label="Drums / electronic kit"
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

        {/* Screen 17: Final Lead Capture */}
        {step === 17 && (
          <QuizCard key="step17">
            <QuizCardTitle subtitle="Almost done!">
              What's your child's name?
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
              "See My Child's Music Readiness Score"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

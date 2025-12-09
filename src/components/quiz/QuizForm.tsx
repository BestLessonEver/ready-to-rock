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
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

const initialAnswers: QuizAnswers = {
  childName: "",
  childAge: 6,
  priorExperience: "",
  focusDuration: "",
  energyLevel: "",
  challengeResponse: "",
  personalityStyle: "",
  interests: [],
  favoriteMusic: "",
  instrumentsAtHome: [],
  practiceDaysPerWeek: "",
  parentName: "",
  email: "",
  phone: "",
  cityOrZip: "",
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

  const toggleArrayItem = (key: 'interests' | 'instrumentsAtHome', item: string) => {
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
      case 1:
        return answers.childName.trim() !== "" && answers.childAge > 0 && answers.priorExperience !== "";
      case 2:
        return answers.focusDuration !== "" && answers.energyLevel !== "";
      case 3:
        return answers.challengeResponse !== "" && answers.personalityStyle !== "";
      case 4:
        return answers.interests.length > 0 && answers.favoriteMusic !== "";
      case 5:
        return answers.instrumentsAtHome.length > 0 && answers.practiceDaysPerWeek !== "";
      case 6:
        return answers.parentName.trim() !== "" && answers.email.trim() !== "";
      default:
        return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(answers.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const submission = createSubmission(answers);
    saveSubmission(submission);
    
    navigate(`/results/${submission.id}`);
  };

  const nextStep = () => {
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
    <div className="w-full max-w-lg mx-auto space-y-6">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="min-h-[400px]">
        {step === 1 && (
          <QuizCard key="step1">
            <QuizCardTitle subtitle="Let's start with the basics">
              Tell us about your child
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge">Age</Label>
                <Input
                  id="childAge"
                  type="number"
                  min={4}
                  max={14}
                  placeholder="4-14"
                  value={answers.childAge || ""}
                  onChange={e => updateAnswer("childAge", parseInt(e.target.value) || 0)}
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label>Has your child had music lessons before?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="No, total beginner"
                    selected={answers.priorExperience === "none"}
                    onClick={() => updateAnswer("priorExperience", "none")}
                  />
                  <OptionButton
                    label="A little (under 6 months)"
                    selected={answers.priorExperience === "little"}
                    onClick={() => updateAnswer("priorExperience", "little")}
                  />
                  <OptionButton
                    label="Yes (6+ months)"
                    selected={answers.priorExperience === "yes-6-plus"}
                    onClick={() => updateAnswer("priorExperience", "yes-6-plus")}
                  />
                </div>
              </div>
            </div>
          </QuizCard>
        )}

        {step === 2 && (
          <QuizCard key="step2">
            <QuizCardTitle subtitle="Understanding their attention and energy">
              Focus & Energy
            </QuizCardTitle>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>How long can your child usually focus on something they enjoy?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Less than 5 minutes"
                    selected={answers.focusDuration === "less-than-5"}
                    onClick={() => updateAnswer("focusDuration", "less-than-5")}
                  />
                  <OptionButton
                    label="5–10 minutes"
                    selected={answers.focusDuration === "5-10"}
                    onClick={() => updateAnswer("focusDuration", "5-10")}
                  />
                  <OptionButton
                    label="10–20 minutes"
                    selected={answers.focusDuration === "10-20"}
                    onClick={() => updateAnswer("focusDuration", "10-20")}
                  />
                  <OptionButton
                    label="20+ minutes"
                    selected={answers.focusDuration === "20-plus"}
                    onClick={() => updateAnswer("focusDuration", "20-plus")}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>How would you describe their energy level?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Very calm"
                    selected={answers.energyLevel === "calm"}
                    onClick={() => updateAnswer("energyLevel", "calm")}
                  />
                  <OptionButton
                    label="In between"
                    selected={answers.energyLevel === "in-between"}
                    onClick={() => updateAnswer("energyLevel", "in-between")}
                  />
                  <OptionButton
                    label="High energy / always moving"
                    selected={answers.energyLevel === "high-energy"}
                    onClick={() => updateAnswer("energyLevel", "high-energy")}
                  />
                </div>
              </div>
            </div>
          </QuizCard>
        )}

        {step === 3 && (
          <QuizCard key="step3">
            <QuizCardTitle subtitle="How they approach learning">
              Personality & Learning Style
            </QuizCardTitle>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>How does your child usually respond to challenges?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Gets discouraged quickly"
                    selected={answers.challengeResponse === "discouraged"}
                    onClick={() => updateAnswer("challengeResponse", "discouraged")}
                  />
                  <OptionButton
                    label="Needs encouragement but keeps going"
                    selected={answers.challengeResponse === "needs-encouragement"}
                    onClick={() => updateAnswer("challengeResponse", "needs-encouragement")}
                  />
                  <OptionButton
                    label="Loves a challenge and doesn't give up"
                    selected={answers.challengeResponse === "loves-challenge"}
                    onClick={() => updateAnswer("challengeResponse", "loves-challenge")}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Which sounds more like your child?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Follows directions well"
                    selected={answers.personalityStyle === "follows-directions"}
                    onClick={() => updateAnswer("personalityStyle", "follows-directions")}
                  />
                  <OptionButton
                    label="Creative and likes to experiment"
                    selected={answers.personalityStyle === "creative"}
                    onClick={() => updateAnswer("personalityStyle", "creative")}
                  />
                  <OptionButton
                    label="A mix of both"
                    selected={answers.personalityStyle === "mixed"}
                    onClick={() => updateAnswer("personalityStyle", "mixed")}
                  />
                </div>
              </div>
            </div>
          </QuizCard>
        )}

        {step === 4 && (
          <QuizCard key="step4">
            <QuizCardTitle subtitle="What gets them excited">
              Musical Interests
            </QuizCardTitle>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>What does your child seem most interested in? (Select all that apply)</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Singing"
                    selected={answers.interests.includes("singing")}
                    onClick={() => toggleArrayItem("interests", "singing")}
                    multiSelect
                  />
                  <OptionButton
                    label="Piano / keyboard"
                    selected={answers.interests.includes("piano-keyboard")}
                    onClick={() => toggleArrayItem("interests", "piano-keyboard")}
                    multiSelect
                  />
                  <OptionButton
                    label="Guitar / ukulele"
                    selected={answers.interests.includes("guitar-ukulele")}
                    onClick={() => toggleArrayItem("interests", "guitar-ukulele")}
                    multiSelect
                  />
                  <OptionButton
                    label="Drums"
                    selected={answers.interests.includes("drums")}
                    onClick={() => toggleArrayItem("interests", "drums")}
                    multiSelect
                  />
                  <OptionButton
                    label="Writing songs / making up tunes"
                    selected={answers.interests.includes("songwriting")}
                    onClick={() => toggleArrayItem("interests", "songwriting")}
                    multiSelect
                  />
                  <OptionButton
                    label="Not sure yet"
                    selected={answers.interests.includes("not-sure")}
                    onClick={() => toggleArrayItem("interests", "not-sure")}
                    multiSelect
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>What kind of music do they like?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Disney / Pop / Radio hits"
                    selected={answers.favoriteMusic === "disney-pop"}
                    onClick={() => updateAnswer("favoriteMusic", "disney-pop")}
                  />
                  <OptionButton
                    label="Rock / Band music"
                    selected={answers.favoriteMusic === "rock-band"}
                    onClick={() => updateAnswer("favoriteMusic", "rock-band")}
                  />
                  <OptionButton
                    label="Classical / Calm music"
                    selected={answers.favoriteMusic === "classical"}
                    onClick={() => updateAnswer("favoriteMusic", "classical")}
                  />
                  <OptionButton
                    label="Video game / movie music"
                    selected={answers.favoriteMusic === "video-game"}
                    onClick={() => updateAnswer("favoriteMusic", "video-game")}
                  />
                  <OptionButton
                    label="All over the place"
                    selected={answers.favoriteMusic === "all-over"}
                    onClick={() => updateAnswer("favoriteMusic", "all-over")}
                  />
                </div>
              </div>
            </div>
          </QuizCard>
        )}

        {step === 5 && (
          <QuizCard key="step5">
            <QuizCardTitle subtitle="Setting up for success">
              Environment & Practice
            </QuizCardTitle>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Do you have any instruments at home? (Select all that apply)</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="Piano / keyboard"
                    selected={answers.instrumentsAtHome.includes("piano-keyboard")}
                    onClick={() => toggleArrayItem("instrumentsAtHome", "piano-keyboard")}
                    multiSelect
                  />
                  <OptionButton
                    label="Guitar / ukulele"
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
                    label="No instruments yet"
                    selected={answers.instrumentsAtHome.includes("none")}
                    onClick={() => toggleArrayItem("instrumentsAtHome", "none")}
                    multiSelect
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>How many days per week could your child realistically practice 10–20 minutes?</Label>
                <div className="space-y-2">
                  <OptionButton
                    label="1–2 days"
                    selected={answers.practiceDaysPerWeek === "1-2"}
                    onClick={() => updateAnswer("practiceDaysPerWeek", "1-2")}
                  />
                  <OptionButton
                    label="3–4 days"
                    selected={answers.practiceDaysPerWeek === "3-4"}
                    onClick={() => updateAnswer("practiceDaysPerWeek", "3-4")}
                  />
                  <OptionButton
                    label="5+ days"
                    selected={answers.practiceDaysPerWeek === "5-plus"}
                    onClick={() => updateAnswer("practiceDaysPerWeek", "5-plus")}
                  />
                </div>
              </div>
            </div>
          </QuizCard>
        )}

        {step === 6 && (
          <QuizCard key="step6">
            <QuizCardTitle subtitle="Almost done! We'll send you the results">
              Your Contact Info
            </QuizCardTitle>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="parentName">Your name</Label>
                <Input
                  id="parentName"
                  placeholder="Your first name"
                  value={answers.parentName}
                  onChange={e => updateAnswer("parentName", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={answers.email}
                  onChange={e => updateAnswer("email", e.target.value)}
                  className={cn("h-12", errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={answers.phone}
                  onChange={e => updateAnswer("phone", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityOrZip">City or ZIP code</Label>
                <Input
                  id="cityOrZip"
                  placeholder="Friendswood or 77546"
                  value={answers.cityOrZip}
                  onChange={e => updateAnswer("cityOrZip", e.target.value)}
                  className="h-12"
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                We'll email you your child's results so you can refer back anytime. No spam, ever.
              </p>
            </div>
          </QuizCard>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {step < TOTAL_STEPS ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1"
            variant="hero"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="flex-1"
            variant="hero"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              "See My Child's Score"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

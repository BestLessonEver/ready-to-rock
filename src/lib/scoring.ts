export interface QuizAnswers {
  // Lead capture fields
  parentName: string;
  email: string;
  childName: string;
  phone: string;

  // Musical aptitude questions
  pitch: string;
  rhythm: string;
  memory: string;
  emotionalResponse: string;

  // Musical behavior questions
  hummingSinging: string;
  rhythmPlay: string;
  dancing: string;
  drawnToInstruments: string;

  // Personality questions
  performerStyle: string;
  focusDuration: string;

  // Motivation & environment
  wantsToLearn: string;
  instrumentsAtHome: string[];
}

export interface ScoringResult {
  score: number;
  band: 'emerging' | 'ready-with-support' | 'ready-to-thrive';
  bandLabel: string;
  primaryInstrument: string;
  secondaryInstruments: string[];
  bandDescription: string;
}

export function calculateReadinessScore(answers: QuizAnswers): ScoringResult {
  let score = 30; // Base score (lowered from 50)

  // Pitch (Q2) - heavy weight (max +8)
  switch (answers.pitch) {
    case 'yes-on-tune':
      score += 8;
      break;
    case 'sometimes':
      score += 4;
      break;
    case 'not-really':
      score += 1;
      break;
  }

  // Rhythm (Q3) - heavy weight (max +8)
  switch (answers.rhythm) {
    case 'yes':
      score += 8;
      break;
    case 'sometimes':
      score += 4;
      break;
    case 'not-yet':
      score += 1;
      break;
  }

  // Memory (Q4) - heavy weight (max +7)
  switch (answers.memory) {
    case 'yes':
      score += 7;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'not-really':
      score += 1;
      break;
  }

  // Emotional response (Q5) - medium weight (max +6)
  switch (answers.emotionalResponse) {
    case 'yes':
      score += 6;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'not-noticed':
      score += 1;
      break;
  }

  // Humming/Singing (Q6) - medium weight (max +6)
  switch (answers.hummingSinging) {
    case 'all-the-time':
      score += 6;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'rarely':
      score += 1;
      break;
  }

  // Rhythm play (Q7) - medium weight (max +6)
  switch (answers.rhythmPlay) {
    case 'constantly':
      score += 6;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'rarely':
      score += 1;
      break;
  }

  // Dancing (Q8) - medium weight (max +5)
  switch (answers.dancing) {
    case 'yes':
      score += 5;
      break;
    case 'sometimes':
      score += 2;
      break;
    case 'no':
      score += 0;
      break;
  }

  // Drawn to instruments (Q9) - medium weight (max +5)
  switch (answers.drawnToInstruments) {
    case 'yes':
      score += 5;
      break;
    case 'sometimes':
      score += 2;
      break;
    case 'not-really':
      score += 0;
      break;
  }

  // Performer style - light weight (max +5)
  switch (answers.performerStyle) {
    case 'loves-showing':
      score += 5;
      break;
    case 'shy-but-tries':
      score += 3;
      break;
    case 'nervous':
      score += 1;
      break;
  }

  // Focus duration (Q12) - medium weight (max +7)
  switch (answers.focusDuration) {
    case '20-plus':
      score += 7;
      break;
    case '10-20':
      score += 4;
      break;
    case '5-10':
      score += 2;
      break;
    case 'under-5':
      score += 0;
      break;
  }

  // Motivation - wants to learn (Q13) - light weight (max +4)
  switch (answers.wantsToLearn) {
    case 'yes':
      score += 4;
      break;
    case 'not-yet':
      score += 2;
      break;
    case 'no':
      score += 0;
      break;
  }

  // Instruments at home (Q14) - light weight (max +3)
  if (answers.instrumentsAtHome.length > 0 && !answers.instrumentsAtHome.includes('not-yet')) {
    score += 3;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine band
  let band: ScoringResult['band'];
  let bandLabel: string;
  let bandDescription: string;

  if (score < 50) {
    band = 'emerging';
    bandLabel = 'Emerging Readiness';
    bandDescription = "Your child is curious about music, and that's a great start. With the right low-pressure environment and some playful exposure, they can grow into lessons at their own pace. Here's what to focus on next week.";
  } else if (score < 75) {
    band = 'ready-with-support';
    bandLabel = 'Ready With Support';
    bandDescription = "Your child is ready to start lessons, as long as we keep things fun, encouraging, and matched to their personality. With the right teacher and routine, they can make solid progress quickly.";
  } else {
    band = 'ready-to-thrive';
    bandLabel = 'Ready to Thrive';
    bandDescription = "Your child is an excellent candidate for music lessons. With the right teacher and instrument match, they're likely to thrive and move fast.";
  }

  // Determine instruments
  const { primaryInstrument, secondaryInstruments } = recommendInstruments(answers);

  return {
    score,
    band,
    bandLabel,
    primaryInstrument,
    secondaryInstruments,
    bandDescription,
  };
}

function recommendInstruments(answers: QuizAnswers): { primaryInstrument: string; secondaryInstruments: string[] } {
  const instrumentScores: Record<string, number> = {
    piano: 10,
    guitar: 0,
    drums: 0,
    voice: 0,
    ukulele: 0,
  };

  // Strong pitch and emotional response → voice priority
  if (answers.pitch === 'yes-on-tune') {
    instrumentScores.voice += 20;
    instrumentScores.piano += 10;
  }
  if (answers.emotionalResponse === 'yes') {
    instrumentScores.voice += 10;
    instrumentScores.piano += 5;
  }

  // Rhythm play and dancing → drums priority
  if (answers.rhythmPlay === 'constantly') {
    instrumentScores.drums += 20;
    instrumentScores.guitar += 8;
  }
  if (answers.dancing === 'yes') {
    instrumentScores.drums += 15;
  }

  // Humming/singing → voice
  if (answers.hummingSinging === 'all-the-time') {
    instrumentScores.voice += 15;
  }

  // Drawn to instruments + wants to learn → piano as safe starting point
  if (answers.drawnToInstruments === 'yes') {
    instrumentScores.piano += 10;
    instrumentScores.guitar += 8;
  }
  if (answers.wantsToLearn === 'yes') {
    instrumentScores.piano += 8;
  }

  // Low focus → piano or drums (short, playful lessons)
  if (answers.focusDuration === 'under-5' || answers.focusDuration === '5-10') {
    instrumentScores.drums += 10;
    instrumentScores.piano += 5;
    instrumentScores.ukulele += 8;
  }

  // Performer style
  if (answers.performerStyle === 'loves-showing') {
    instrumentScores.voice += 10;
    instrumentScores.guitar += 5;
  }

  // Instruments at home bonus
  answers.instrumentsAtHome.forEach(inst => {
    if (inst === 'keyboard-piano') instrumentScores.piano += 15;
    if (inst === 'guitar-ukulele') {
      instrumentScores.guitar += 15;
      instrumentScores.ukulele += 15;
    }
    if (inst === 'drums') instrumentScores.drums += 15;
  });

  // Sort and pick
  const sorted = Object.entries(instrumentScores)
    .sort((a, b) => b[1] - a[1])
    .map(([inst]) => inst);

  const instrumentLabels: Record<string, string> = {
    piano: 'Piano',
    guitar: 'Guitar',
    drums: 'Drums',
    voice: 'Voice',
    ukulele: 'Ukulele',
  };

  const primary = instrumentLabels[sorted[0]] || 'Piano';
  const secondaries = sorted.slice(1, 3).map(inst => instrumentLabels[inst]);

  return {
    primaryInstrument: primary,
    secondaryInstruments: secondaries,
  };
}

// Fallback action plan if AI fails
export function generateActionPlan(answers: QuizAnswers, result: ScoringResult): string[] {
  const plan: string[] = [];
  const { band, primaryInstrument } = result;
  const childName = answers.childName || 'your child';

  plan.push(`Ask ${childName} which instrument they think looks the coolest — their answer might surprise you.`);
  plan.push("Pick one performance video on YouTube and watch it together. Ask what they liked about it.");

  if (answers.instrumentsAtHome.length > 0 && !answers.instrumentsAtHome.includes('not-yet')) {
    plan.push(`Let ${childName} explore the ${primaryInstrument.toLowerCase()} at home with no pressure. Ask them to show you their favorite sound.`);
  } else {
    plan.push("Use a simple rhythm game: clap or tap along to a favorite song together.");
  }

  if (band === 'emerging') {
    plan.push("Focus on fun over structure. Dance parties, singing in the car, or tapping on pots all count.");
  } else if (band === 'ready-with-support') {
    plan.push(`Talk about what kind of teacher personality might click with ${childName} (silly? calm? energetic?).`);
  } else {
    plan.push(`Research local options and book a trial lesson to see how ${childName} responds to real instruction.`);
  }

  plan.push("Set aside 5 minutes this week for 'music time' — no agenda, just play.");

  return plan.slice(0, 6);
}

export interface Insights {
  profileType: string;
  strengths: string[];
  learningStyle: string;
  performerType: string;
  instrumentReasoning: string;
  superpower: string;
}

export interface Submission extends QuizAnswers, ScoringResult {
  id: string;
  createdAt: string;
  actionPlan: string[];
  source: string;
  insights?: Insights;
}

// Create initial submission with fallback action plan (can be updated with AI plan later)
export function createSubmission(answers: QuizAnswers): Submission {
  const result = calculateReadinessScore(answers);
  const actionPlan = generateActionPlan(answers, result);
  
  return {
    ...answers,
    ...result,
    id: generateId(),
    createdAt: new Date().toISOString(),
    actionPlan,
    source: 'Music Readiness Score',
  };
}

// Prepare data for AI action plan generation
export function getActionPlanContext(submission: Submission) {
  return {
    childName: submission.childName,
    parentName: submission.parentName,
    score: submission.score,
    band: submission.band,
    bandLabel: submission.bandLabel,
    primaryInstrument: submission.primaryInstrument,
    secondaryInstruments: submission.secondaryInstruments,
    instrumentsAtHome: submission.instrumentsAtHome,
    focusDuration: submission.focusDuration,
    performerStyle: submission.performerStyle,
    wantsToLearn: submission.wantsToLearn,
    drawnToInstruments: submission.drawnToInstruments,
    hummingSinging: submission.hummingSinging,
    rhythmPlay: submission.rhythmPlay,
    dancing: submission.dancing,
  };
}

function generateId(): string {
  return `mrs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

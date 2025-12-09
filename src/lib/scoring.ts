export interface QuizAnswers {
  childName: string;
  childAge: number;
  priorExperience: string;
  focusDuration: string;
  energyLevel: string;
  challengeResponse: string;
  personalityStyle: string;
  interests: string[];
  favoriteMusic: string;
  instrumentsAtHome: string[];
  practiceDaysPerWeek: string;
  parentName: string;
  email: string;
  phone: string;
  cityOrZip: string;
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
  let score = 50;

  // Age scoring
  const age = answers.childAge;
  if (age >= 4 && age <= 5) {
    score += 0;
  } else if (age >= 6 && age <= 8) {
    score += 10;
  } else if (age >= 9 && age <= 14) {
    score += 15;
  }

  // Focus duration scoring
  switch (answers.focusDuration) {
    case 'less-than-5':
      score -= 10;
      break;
    case '5-10':
      score += 0;
      break;
    case '10-20':
      score += 10;
      break;
    case '20-plus':
      score += 15;
      break;
  }

  // Challenge response scoring
  switch (answers.challengeResponse) {
    case 'discouraged':
      score -= 5;
      break;
    case 'needs-encouragement':
      score += 5;
      break;
    case 'loves-challenge':
      score += 10;
      break;
  }

  // Practice days scoring
  switch (answers.practiceDaysPerWeek) {
    case '1-2':
      score -= 5;
      break;
    case '3-4':
      score += 5;
      break;
    case '5-plus':
      score += 10;
      break;
  }

  // Prior experience bonus
  if (answers.priorExperience === 'yes-6-plus') {
    score += 5;
  } else if (answers.priorExperience === 'little') {
    score += 2;
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
  const interests = answers.interests;
  const age = answers.childAge;
  const energy = answers.energyLevel;
  const personality = answers.personalityStyle;
  const focus = answers.focusDuration;

  // Priority map for instruments
  const instrumentScores: Record<string, number> = {
    piano: 0,
    guitar: 0,
    drums: 0,
    voice: 0,
    ukulele: 0,
  };

  // Explicit interest selection (highest priority)
  if (interests.includes('piano-keyboard')) instrumentScores.piano += 30;
  if (interests.includes('guitar-ukulele')) {
    instrumentScores.guitar += 25;
    instrumentScores.ukulele += 20;
  }
  if (interests.includes('drums')) instrumentScores.drums += 30;
  if (interests.includes('singing')) instrumentScores.voice += 30;
  if (interests.includes('songwriting')) {
    instrumentScores.piano += 15;
    instrumentScores.guitar += 10;
  }

  // Energy level influence
  if (energy === 'high-energy') {
    instrumentScores.drums += 15;
    instrumentScores.guitar += 10;
  } else if (energy === 'calm') {
    instrumentScores.piano += 10;
    instrumentScores.voice += 5;
  }

  // Age considerations
  if (age <= 6) {
    instrumentScores.piano += 10;
    instrumentScores.ukulele += 10;
    if (focus === 'less-than-5' || focus === '5-10') {
      instrumentScores.drums += 8;
      instrumentScores.piano += 5;
    }
  }

  // Personality influence
  if (personality === 'creative') {
    instrumentScores.piano += 8;
    instrumentScores.guitar += 8;
  } else if (personality === 'follows-directions') {
    instrumentScores.piano += 5;
  }

  // Music preference influence
  switch (answers.favoriteMusic) {
    case 'disney-pop':
      instrumentScores.voice += 10;
      instrumentScores.piano += 8;
      break;
    case 'rock-band':
      instrumentScores.guitar += 12;
      instrumentScores.drums += 10;
      break;
    case 'classical':
      instrumentScores.piano += 15;
      break;
    case 'video-game':
      instrumentScores.piano += 10;
      instrumentScores.guitar += 5;
      break;
  }

  // Instruments at home bonus
  answers.instrumentsAtHome.forEach(inst => {
    if (inst === 'piano-keyboard') instrumentScores.piano += 10;
    if (inst === 'guitar-ukulele') {
      instrumentScores.guitar += 10;
      instrumentScores.ukulele += 10;
    }
    if (inst === 'drums') instrumentScores.drums += 10;
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

export function generateActionPlan(answers: QuizAnswers, result: ScoringResult): string[] {
  const plan: string[] = [];
  const { band, primaryInstrument } = result;

  // Universal action
  plan.push("Pick one performance video on YouTube and watch it together. Ask what they liked about it.");

  // Based on practice commitment
  if (answers.practiceDaysPerWeek === '1-2') {
    plan.push("Choose just 2 days this week for 'music time' — even if it's just 5–10 minutes.");
  } else if (answers.practiceDaysPerWeek === '3-4') {
    plan.push("Set up a simple practice routine: same time, same place, for 10-15 minutes.");
  } else {
    plan.push("Create a mini practice chart and let them put a sticker after each session.");
  }

  // Based on instruments at home
  if (answers.instrumentsAtHome.length > 0 && !answers.instrumentsAtHome.includes('none')) {
    plan.push(`Let your child explore the ${primaryInstrument.toLowerCase()} with no pressure. Ask them to show you their favorite sound.`);
  } else {
    plan.push("Use a simple rhythm game: clap or tap along to a favorite song together.");
    plan.push("Look up 'beginner keyboard app' or 'rhythm games for kids' — free apps can spark interest.");
  }

  // Based on band
  if (band === 'emerging') {
    plan.push("Focus on fun over structure. Dance parties, singing in the car, or tapping on pots all count.");
    plan.push("Ask your child to 'teach' you a song they know — even if it's made up!");
  } else if (band === 'ready-with-support') {
    plan.push("Talk about what kind of teacher personality might click with your child (silly? calm? energetic?).");
    plan.push("Set a small goal together: 'By next month, let's learn one simple song.'");
  } else {
    plan.push("Research local options and book a trial lesson to see how they respond to real instruction.");
    plan.push("Ask your child what they'd like to learn to play — ownership boosts motivation.");
  }

  // Based on focus duration
  if (answers.focusDuration === 'less-than-5') {
    plan.push("Keep any music activity under 5 minutes this week. Short wins build momentum.");
  }

  return plan.slice(0, 6);
}

export interface Submission extends QuizAnswers, ScoringResult {
  id: string;
  createdAt: string;
  actionPlan: string[];
  source: string;
}

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

function generateId(): string {
  return `mrs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

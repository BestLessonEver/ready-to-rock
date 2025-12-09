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
  handlesCorrection: string;
  performerStyle: string;
  focusDuration: string;

  // Motivation & environment
  wantsToLearn: string;
  favoriteSongBehavior: string;
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
  let score = 50;

  // Pitch (Q2) - heavy weight
  switch (answers.pitch) {
    case 'yes-on-tune':
      score += 12;
      break;
    case 'sometimes':
      score += 6;
      break;
    case 'not-really':
      score += 3;
      break;
  }

  // Rhythm (Q3) - heavy weight
  switch (answers.rhythm) {
    case 'yes':
      score += 12;
      break;
    case 'sometimes':
      score += 6;
      break;
    case 'not-yet':
      score += 2;
      break;
  }

  // Memory (Q4) - heavy weight
  switch (answers.memory) {
    case 'yes':
      score += 10;
      break;
    case 'sometimes':
      score += 5;
      break;
    case 'not-really':
      score += 2;
      break;
  }

  // Emotional response (Q5) - heavy weight
  switch (answers.emotionalResponse) {
    case 'yes':
      score += 8;
      break;
    case 'sometimes':
      score += 4;
      break;
    case 'not-noticed':
      score += 1;
      break;
  }

  // Humming/Singing (Q6) - medium weight
  switch (answers.hummingSinging) {
    case 'all-the-time':
      score += 8;
      break;
    case 'sometimes':
      score += 4;
      break;
    case 'rarely':
      score += 1;
      break;
  }

  // Rhythm play (Q7) - medium weight
  switch (answers.rhythmPlay) {
    case 'constantly':
      score += 8;
      break;
    case 'sometimes':
      score += 4;
      break;
    case 'rarely':
      score += 1;
      break;
  }

  // Dancing (Q8) - medium weight
  switch (answers.dancing) {
    case 'yes':
      score += 6;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'no':
      score += 1;
      break;
  }

  // Drawn to instruments (Q9) - medium weight
  switch (answers.drawnToInstruments) {
    case 'yes':
      score += 6;
      break;
    case 'sometimes':
      score += 3;
      break;
    case 'not-really':
      score += 1;
      break;
  }

  // Handles correction (Q10) - light weight
  switch (answers.handlesCorrection) {
    case 'jumps-in':
      score += 8;
      break;
    case 'needs-encouragement':
      score += 5;
      break;
    case 'frustrated':
      score += 2;
      break;
  }

  // Performer style (Q11) - light weight
  switch (answers.performerStyle) {
    case 'loves-showing':
      score += 6;
      break;
    case 'shy-but-tries':
      score += 4;
      break;
    case 'nervous':
      score += 2;
      break;
  }

  // Focus duration (Q12) - light weight
  switch (answers.focusDuration) {
    case '20-plus':
      score += 10;
      break;
    case '10-20':
      score += 6;
      break;
    case '5-10':
      score += 3;
      break;
    case 'under-5':
      score += 0;
      break;
  }

  // Motivation - wants to learn (Q13) - light weight
  switch (answers.wantsToLearn) {
    case 'yes':
      score += 5;
      break;
    case 'not-yet':
      score += 2;
      break;
    case 'no':
      score += 0;
      break;
  }

  // Favorite song behavior (Q14) - light weight
  switch (answers.favoriteSongBehavior) {
    case 'yes':
      score += 4;
      break;
    case 'sometimes':
      score += 2;
      break;
    case 'rarely':
      score += 0;
      break;
  }

  // Instruments at home (Q15) - light weight
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

export function generateActionPlan(answers: QuizAnswers, result: ScoringResult): string[] {
  const plan: string[] = [];
  const { band, primaryInstrument } = result;

  // Universal action
  plan.push("Pick one performance video on YouTube and watch it together. Ask what they liked about it.");

  // Based on instruments at home
  if (answers.instrumentsAtHome.length > 0 && !answers.instrumentsAtHome.includes('not-yet')) {
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
  if (answers.focusDuration === 'under-5') {
    plan.push("Keep any music activity under 5 minutes this week. Short wins build momentum.");
  }

  // Based on wants to learn
  if (answers.wantsToLearn === 'yes') {
    plan.push("Since they've expressed interest, ask what instrument or song sparked that curiosity.");
  }

  // Based on performer style
  if (answers.performerStyle === 'nervous') {
    plan.push("Create a safe space for musical play — no audience, no pressure, just exploration.");
  }

  // Based on drawn to instruments
  if (answers.drawnToInstruments === 'yes') {
    plan.push("Next time you see an instrument in public, let them explore it for a few minutes.");
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

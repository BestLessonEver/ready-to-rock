import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed origins for production requests
const ALLOWED_ORIGINS = [
  "https://ddzzdwzxpssittevvpdi.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

// Input validation schema
const SubmissionDataSchema = z.object({
  childName: z.string().min(1).max(100),
  parentName: z.string().min(1).max(100),
  score: z.number().min(0).max(100),
  band: z.enum(['emerging', 'ready-with-support', 'ready-to-thrive']),
  bandLabel: z.string().max(100),
  primaryInstrument: z.string().max(100),
  secondaryInstruments: z.array(z.string().max(100)).max(5),
  instrumentsAtHome: z.array(z.string().max(50)).max(10),
  focusDuration: z.string().max(50),
  performerStyle: z.string().max(50),
  wantsToLearn: z.string().max(50),
  drawnToInstruments: z.string().max(50),
  hummingSinging: z.string().max(50),
  rhythmPlay: z.string().max(50),
  dancing: z.string().max(50),
});

type SubmissionData = z.infer<typeof SubmissionDataSchema>;

// Validate request origin
function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return true;
  }
  
  if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
    return true;
  }
  
  return false;
}

// Sanitize string for use in AI prompts to prevent prompt injection
function sanitizeForPrompt(str: string): string {
  return str
    .replace(/[<>{}[\]]/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 200);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate origin
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    console.log("Request origin:", origin, "referer:", referer);
    
    if (!isValidOrigin(req)) {
      console.warn("Request from unauthorized origin:", origin || referer);
      return new Response(JSON.stringify({ error: "Unauthorized origin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read body as text first to handle empty body gracefully
    const bodyText = await req.text();
    console.log("Request body length:", bodyText?.length || 0);

    if (!bodyText || bodyText.length === 0) {
      console.error("Empty request body received");
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validationResult = SubmissionDataSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submission = validationResult.data;
    console.log("Generating action plan for:", submission.childName);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about what instruments are at home
    const homeInstruments = submission.instrumentsAtHome
      .filter(i => i !== 'not-yet')
      .map(i => {
        if (i === 'keyboard-piano') return 'keyboard/piano';
        if (i === 'guitar-ukulele') return 'guitar/ukulele';
        return sanitizeForPrompt(i);
      });
    
    const hasInstruments = homeInstruments.length > 0;

    // Sanitize user inputs for the prompt
    const sanitizedChildName = sanitizeForPrompt(submission.childName);
    const sanitizedBandLabel = sanitizeForPrompt(submission.bandLabel);
    const sanitizedPrimaryInstrument = sanitizeForPrompt(submission.primaryInstrument);
    const sanitizedSecondaryInstruments = submission.secondaryInstruments.map(sanitizeForPrompt).join(', ');

    const systemPrompt = `You are a music education advisor for Best Lesson Ever, a modern, student-led music school. Your job is to create bold, modern, fun, highly actionable first-week action plans for parents based on their child's music readiness assessment.

Tone rules:
- Direct, confident, modern, exciting, and fun
- No fluff, no teacher jargon, no cheesy sales writing
- One sentence per bullet, punchy and energetic
- Always focus on the child, not the parent
- Always use the child's name 2–3 times throughout the plan

Action Plan Structure (always follow this sequence):

1. TONIGHT ACTION (always the same wording):
   "Tonight, play one of ${sanitizedChildName}'s favorite songs and have them clap to the beat, sing along, or try both at the same time. Take note of how close they are to the rhythm and melody. "

2. MICRO-TEST (adaptive based on child traits):
   - If the child hums or sings → Melody Echo Game (sing a tiny 2–3 note pattern and have them echo it)
   - If the child taps/beatboxes → Rhythm Duel (tap a short pattern and have them copy it)
   - If the child dances → Freeze Game (play music and freeze randomly)
   - If the child is shy/quiet → Gentle Call & Response (clap one pattern and have them clap it back softly)
   - If the child loves performing → Surprise Karaoke Party (Have them perform their favorite song in the living room while singing along)

3. INSTRUMENT TRYOUT (only include if the household owns that instrument):
   - Guitar or Ukulele at home → See if they can play an E minor chord (2 fingers) on guitar or a C major chord on ukulele (1 finger)
   - Piano/keyboard at home → Play random notes and see if the child can sing them back; test high/low recognition; the parent may sing along
   - Drums at home → See if they can keep a stead beat on the snare or play a simple kick/snare drum beat

4. DISCOVERY MOMENT (always include):
   Instrument Personality Test:
   "Show quick clips of a drummer, guitarist, pianist, and singer, and ask ${sanitizedChildName}: 'Which one would YOU want to be?'"

5. CONFIDENCE MOMENT (adaptive):
   - If they love performing → tiny living-room concert
   - If shy → private one-person show
   - If rhythmic → "show me your beat" moment
   - If exploratory → "show me your favorite sound"
   - If creative → 3-word songwriting challenge

6. TRIAL LESSON (always the final bullet):
   "Sign ${sanitizedChildName} up for a trial lesson at a local music school—an experienced instructor can spot strengths within minutes and give clear next steps."

Other Rules:
- Always produce 5–6 bullets
- Always return ONLY a JSON array of bullet strings
- No explanations, no markdown, no extra text
- Keep bullets short, doable within 5–10 minutes
- Incorporate readiness level: 
   • Emerging → more playful, low-pressure
   • Ready With Support → balanced structure + fun
   • Ready to Thrive → slightly more goal-oriented`;

    const userPrompt = `Create a personalized first-week action plan for this child:

Child's name: ${sanitizedChildName}
Readiness level: ${sanitizedBandLabel} (score: ${submission.score}/100)
Recommended instrument: ${sanitizedPrimaryInstrument}
Alternative instruments: ${sanitizedSecondaryInstruments}

Child traits:
- Hums/sings during day: ${submission.hummingSinging}
- Creates rhythms with objects: ${submission.rhythmPlay}
- Dances to music: ${submission.dancing}
- Performer style: ${submission.performerStyle}
- Focus duration: ${formatFocusDuration(submission.focusDuration)}
- Wants to learn an instrument: ${submission.wantsToLearn}
- Drawn to instruments in public: ${submission.drawnToInstruments}

Instruments at home: ${hasInstruments ? homeInstruments.join(', ') : 'None'}

Remember:
- Follow the exact BLE Action Plan Structure
- Adapt Micro-Test and Confidence Moment to the child's traits
- Include the instrument tryout step ONLY if the family owns that instrument
- Use the child's name 2–3 times
- Return ONLY a JSON array of 5–6 bullet strings`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI service unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response content:", content);

    // Parse the JSON array from the response
    let actionPlan: string[];
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      actionPlan = JSON.parse(cleanContent);
      
      if (!Array.isArray(actionPlan)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to a default plan
      actionPlan = getDefaultActionPlan(submission);
    }

    console.log("Generated action plan:", actionPlan);

    return new Response(JSON.stringify({ actionPlan }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating action plan:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function formatFocusDuration(value: string): string {
  switch (value) {
    case '20-plus': return '20+ minutes';
    case '10-20': return '10-20 minutes';
    case '5-10': return '5-10 minutes';
    case 'under-5': return 'Under 5 minutes';
    default: return value;
  }
}

function getDefaultActionPlan(submission: SubmissionData): string[] {
  const plan: string[] = [];
  const { childName, instrumentsAtHome, hummingSinging, dancing, performerStyle } = submission;

  // 1. TONIGHT ACTION (always the same)
  plan.push(`Tonight, play one of ${childName}'s favorite songs and have them clap to the beat, sing along, or try both at the same time.`);

  // 2. MICRO-TEST (adaptive)
  if (hummingSinging === 'all-the-time') {
    plan.push(`Try the Melody Echo Game: sing a tiny 2–3 note pattern and have ${childName} echo it back.`);
  } else if (dancing === 'yes') {
    plan.push(`Play the Freeze Game: put on music and freeze randomly—see if ${childName} can stop on a dime.`);
  } else {
    plan.push(`Try a Rhythm Duel: tap a short pattern and have ${childName} copy it.`);
  }

  // 3. INSTRUMENT TRYOUT (only if they have instruments)
  const hasInstruments = instrumentsAtHome.length > 0 && !instrumentsAtHome.includes('not-yet');
  if (hasInstruments) {
    if (instrumentsAtHome.includes('keyboard-piano')) {
      plan.push(`At the piano, play random notes and have ${childName} try to sing them back—test if they can tell high from low.`);
    } else if (instrumentsAtHome.includes('guitar-ukulele')) {
      plan.push(`Hand ${childName} the guitar/ukulele and help them place two fingers to make an E minor or G chord.`);
    } else if (instrumentsAtHome.includes('drums')) {
      plan.push(`Have ${childName} copy a simple kick–snare pattern on pillows or a practice pad.`);
    }
  }

  // 4. DISCOVERY MOMENT (always include)
  plan.push(`Show quick clips of a drummer, guitarist, pianist, and singer, then ask ${childName}: "Which one would YOU want to be?"`);

  // 5. CONFIDENCE MOMENT (adaptive)
  if (performerStyle === 'loves-showing') {
    plan.push(`Host a tiny living-room concert—let ${childName} pick the song and perform for the family.`);
  } else if (performerStyle === 'nervous') {
    plan.push(`Set up a private one-person show—just ${childName} performing for you, no audience pressure.`);
  } else {
    plan.push(`Ask ${childName} to "show me your favorite sound" on any object around the house.`);
  }

  // 6. TRIAL LESSON (always the final bullet)
  plan.push(`Sign ${childName} up for a trial lesson at a local music school—an experienced instructor can spot strengths within minutes and give clear next steps.`);

  return plan.slice(0, 6);
}

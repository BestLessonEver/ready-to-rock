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
  score: z.number().min(0).max(100),
  band: z.enum(['emerging', 'ready-with-support', 'ready-to-thrive']),
  bandLabel: z.string().max(100),
  primaryInstrument: z.string().max(100),
  secondaryInstruments: z.array(z.string().max(100)).max(5),
  instrumentsAtHome: z.array(z.string().max(50)).max(10),
  pitch: z.string().max(50),
  rhythm: z.string().max(50),
  memory: z.string().max(50),
  emotionalResponse: z.string().max(50),
  hummingSinging: z.string().max(50),
  rhythmPlay: z.string().max(50),
  dancing: z.string().max(50),
  drawnToInstruments: z.string().max(50),
  performerStyle: z.string().max(50),
  focusDuration: z.string().max(50),
  wantsToLearn: z.string().max(50),
});

type SubmissionData = z.infer<typeof SubmissionDataSchema>;

export interface Insights {
  profileType: string;
  strengths: string[];
  learningStyle: string;
  performerType: string;
  instrumentReasoning: string;
  superpower: string;
}

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
  // Remove potential prompt injection attempts
  return str
    .replace(/[<>{}[\]]/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 200); // Limit length
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
    console.log("Generating insights for:", submission.childName);

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

    // Sanitize all user inputs for the prompt
    const sanitizedChildName = sanitizeForPrompt(submission.childName);
    const sanitizedBandLabel = sanitizeForPrompt(submission.bandLabel);
    const sanitizedPrimaryInstrument = sanitizeForPrompt(submission.primaryInstrument);
    const sanitizedSecondaryInstruments = submission.secondaryInstruments.map(sanitizeForPrompt).join(', ');

    const systemPrompt = `You are a music learning specialist for Best Lesson Ever, a modern student-led music school. Your role is to generate deeply personalized, emotionally resonant insights about a child based on their quiz answers. These insights must feel specific, accurate, and screenshot-worthy. Write using a confident, warm, modern tone. No fluff, no generic statements.

You must generate:

1. Musical Profile Type (1 sentence that captures the child's musical personality)
2. Top Musical Strengths (2–3 bullet points highlighting specific abilities)
3. Learning Style Summary (1–2 sentences about how they learn best)
4. Performer Profile (1 sentence describing their performance personality)
5. Recommended Instrument Reasoning (2–3 sentences explaining why the recommended instrument fits them)
6. Musical Superpower (a short, fun label like 'Beat Explorer', 'Melody Maker', 'Rhythm Architect', 'Sound Seeker', 'Sonic Pioneer', etc.)

Rules:
- Always use the child's name
- Never talk about the parent
- Insights must be based ONLY on quiz data
- Keep everything positive, encouraging, and focused on potential
- Return ONLY a JSON object with keys:
  {
    "profileType": string,
    "strengths": string[],
    "learningStyle": string,
    "performerType": string,
    "instrumentReasoning": string,
    "superpower": string
  }
- No markdown, no additional text.`;

    const userPrompt = `Generate personalized insights for this child using their quiz submission data:

Child name: ${sanitizedChildName}
Readiness level: ${sanitizedBandLabel} (score ${submission.score})
Primary instrument recommendation: ${sanitizedPrimaryInstrument}
Secondary instruments: ${sanitizedSecondaryInstruments}

Traits:
- Pitch ability: ${formatPitch(submission.pitch)}
- Rhythm ability: ${formatRhythm(submission.rhythm)}
- Memory: ${formatMemory(submission.memory)}
- Emotional response to music: ${formatEmotionalResponse(submission.emotionalResponse)}
- Hums/sings during the day: ${formatHummingSinging(submission.hummingSinging)}
- Creates rhythms with objects: ${formatRhythmPlay(submission.rhythmPlay)}
- Dances to music: ${formatDancing(submission.dancing)}
- Performer style: ${formatPerformerStyle(submission.performerStyle)}
- Focus duration: ${formatFocusDuration(submission.focusDuration)}
- Wants to learn: ${formatWantsToLearn(submission.wantsToLearn)}
- Drawn to instruments in public: ${formatDrawnToInstruments(submission.drawnToInstruments)}
- Instruments at home: ${homeInstruments.length > 0 ? homeInstruments.join(', ') : 'None'}

Use the insight rules from the system prompt.`;

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

    // Parse the JSON object from the response
    let insights: Insights;
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      insights = JSON.parse(cleanContent);
      
      // Validate required fields
      if (!insights.profileType || !insights.strengths || !insights.learningStyle || 
          !insights.performerType || !insights.instrumentReasoning || !insights.superpower) {
        throw new Error("Missing required fields in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to default insights
      insights = getDefaultInsights(submission);
    }

    console.log("Generated insights:", insights);

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Format helper functions
function formatPitch(value: string): string {
  switch (value) {
    case 'yes-on-tune': return 'Can sing on tune';
    case 'sometimes': return 'Sometimes on pitch';
    case 'not-really': return 'Still developing pitch';
    default: return value;
  }
}

function formatRhythm(value: string): string {
  switch (value) {
    case 'yes': return 'Can follow a beat';
    case 'sometimes': return 'Sometimes follows rhythm';
    case 'not-yet': return 'Still developing rhythm';
    default: return value;
  }
}

function formatMemory(value: string): string {
  switch (value) {
    case 'yes': return 'Remembers melodies well';
    case 'sometimes': return 'Sometimes remembers tunes';
    case 'not-really': return 'Still developing musical memory';
    default: return value;
  }
}

function formatEmotionalResponse(value: string): string {
  switch (value) {
    case 'yes': return 'Strong emotional connection to music';
    case 'sometimes': return 'Sometimes responds emotionally to music';
    case 'not-noticed': return 'Subtle emotional response to music';
    default: return value;
  }
}

function formatHummingSinging(value: string): string {
  switch (value) {
    case 'all-the-time': return 'Constantly hums and sings';
    case 'sometimes': return 'Sometimes hums or sings';
    case 'rarely': return 'Rarely hums or sings';
    default: return value;
  }
}

function formatRhythmPlay(value: string): string {
  switch (value) {
    case 'constantly': return 'Always tapping or drumming';
    case 'sometimes': return 'Sometimes creates rhythms';
    case 'rarely': return 'Rarely creates rhythms';
    default: return value;
  }
}

function formatDancing(value: string): string {
  switch (value) {
    case 'yes': return 'Loves to dance';
    case 'sometimes': return 'Sometimes dances';
    case 'no': return 'Prefers not to dance';
    default: return value;
  }
}

function formatPerformerStyle(value: string): string {
  switch (value) {
    case 'loves-showing': return 'Natural performer, loves the spotlight';
    case 'shy-but-tries': return 'Shy but willing to try';
    case 'nervous': return 'Gets nervous performing';
    default: return value;
  }
}

function formatFocusDuration(value: string): string {
  switch (value) {
    case '20-plus': return '20+ minutes of focus';
    case '10-20': return '10-20 minutes of focus';
    case '5-10': return '5-10 minutes of focus';
    case 'under-5': return 'Under 5 minutes of focus';
    default: return value;
  }
}

function formatWantsToLearn(value: string): string {
  switch (value) {
    case 'yes': return 'Actively wants to learn';
    case 'not-yet': return 'Not sure yet';
    case 'no': return 'Not currently interested';
    default: return value;
  }
}

function formatDrawnToInstruments(value: string): string {
  switch (value) {
    case 'yes': return 'Fascinated by instruments';
    case 'sometimes': return 'Sometimes curious about instruments';
    case 'not-really': return 'Not particularly drawn to instruments';
    default: return value;
  }
}

function getDefaultInsights(submission: SubmissionData): Insights {
  const { childName, primaryInstrument, performerStyle, hummingSinging, rhythmPlay, dancing, pitch, rhythm, memory } = submission;
  
  const strengths: string[] = [];
  if (pitch === 'yes-on-tune') strengths.push(`${childName} has a natural ear for melody and pitch.`);
  if (rhythm === 'yes') strengths.push(`${childName} has strong rhythmic awareness.`);
  if (memory === 'yes') strengths.push(`${childName} has excellent musical memory.`);
  if (hummingSinging === 'all-the-time') strengths.push(`${childName} naturally expresses through song.`);
  if (rhythmPlay === 'constantly') strengths.push(`${childName} is always making beats and rhythms.`);
  
  if (strengths.length < 2) {
    strengths.push(`${childName} shows curiosity and openness to musical exploration.`);
    strengths.push(`${childName} has untapped potential waiting to be discovered.`);
  }

  let performerType = `${childName} is a thoughtful performer who prefers to observe before joining in.`;
  if (performerStyle === 'loves-showing') {
    performerType = `${childName} is a natural showstopper who thrives in the spotlight.`;
  } else if (performerStyle === 'shy-but-tries') {
    performerType = `${childName} is a courageous performer who pushes past comfort zones.`;
  }

  let superpower = 'Sound Explorer';
  if (hummingSinging === 'all-the-time' && pitch === 'yes-on-tune') {
    superpower = 'Melody Maker';
  } else if (rhythmPlay === 'constantly' && dancing === 'yes') {
    superpower = 'Beat Master';
  } else if (memory === 'yes') {
    superpower = 'Tune Keeper';
  }

  return {
    profileType: `${childName} is a curious musical spirit with a unique way of connecting with sound and rhythm.`,
    strengths: strengths.slice(0, 3),
    learningStyle: `${childName} learns best through hands-on exploration and playful experimentation, building confidence through discovery.`,
    performerType,
    instrumentReasoning: `${primaryInstrument} is a great fit for ${childName} because it matches their natural tendencies and interests. This instrument will allow them to express themselves while building foundational skills.`,
    superpower,
  };
}

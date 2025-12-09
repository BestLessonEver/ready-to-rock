import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
  childName: string;
  parentName: string;
  score: number;
  band: 'emerging' | 'ready-with-support' | 'ready-to-thrive';
  bandLabel: string;
  primaryInstrument: string;
  secondaryInstruments: string[];
  instrumentsAtHome: string[];
  focusDuration: string;
  performerStyle: string;
  wantsToLearn: string;
  drawnToInstruments: string;
  hummingSinging: string;
  rhythmPlay: string;
  dancing: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const submission: SubmissionData = await req.json();
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
        return i;
      });
    
    const hasInstruments = homeInstruments.length > 0;

    const systemPrompt = `You are a helpful music education advisor for Best Lesson Ever, a modern student-led music school. You create personalized, actionable first-week action plans for parents based on their child's music readiness assessment.

Your tone is direct, warm, and confident. Talk to parents like intelligent adults. Avoid cheesy sales language.

Guidelines for action items:
- Each item should be specific and achievable within the first week
- Include a mix of discovery activities and practical steps
- If no specific instrument preference was given, include an item about discovering which instrument excites the child most
- Reference instruments at home when applicable
- Match the complexity to the child's readiness level
- For "emerging" readiness: focus on low-pressure, playful exposure
- For "ready-with-support": balance fun with light structure
- For "ready-to-thrive": include more goal-oriented activities

Return ONLY a JSON array of 5-6 action plan strings. No explanation, no markdown formatting, just the JSON array.`;

    const userPrompt = `Create a personalized first-week action plan for this child:

Child's name: ${submission.childName}
Readiness level: ${submission.bandLabel} (score: ${submission.score}/100)
Recommended instrument: ${submission.primaryInstrument}
Alternative instruments: ${submission.secondaryInstruments.join(', ')}
Instruments at home: ${hasInstruments ? homeInstruments.join(', ') : 'None'}
Focus duration: ${formatFocusDuration(submission.focusDuration)}
Performer style: ${formatPerformerStyle(submission.performerStyle)}
Expressed interest in learning: ${submission.wantsToLearn === 'yes' ? 'Yes' : 'Not yet'}
Drawn to instruments in public: ${submission.drawnToInstruments === 'yes' ? 'Yes' : submission.drawnToInstruments === 'sometimes' ? 'Sometimes' : 'Not really'}
Hums/sings during the day: ${submission.hummingSinging === 'all-the-time' ? 'All the time' : submission.hummingSinging === 'sometimes' ? 'Sometimes' : 'Rarely'}
Creates rhythms with objects: ${submission.rhythmPlay === 'constantly' ? 'Constantly' : submission.rhythmPlay === 'sometimes' ? 'Sometimes' : 'Rarely'}
Dances to music: ${submission.dancing === 'yes' ? 'Yes' : submission.dancing === 'sometimes' ? 'Sometimes' : 'No'}

Remember: Include a discovery prompt about what instrument specifically excites ${submission.childName} if they haven't expressed a clear preference. This helps parents have that conversation.`;

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
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

function formatPerformerStyle(value: string): string {
  switch (value) {
    case 'loves-showing': return 'Loves showing off';
    case 'shy-but-tries': return 'A little shy but still tries';
    case 'nervous': return 'Very nervous, prefers privacy';
    default: return value;
  }
}

function getDefaultActionPlan(submission: SubmissionData): string[] {
  const plan: string[] = [];
  const { band, primaryInstrument, childName } = submission;

  plan.push(`Ask ${childName} which instrument they think looks the coolest — their answer might surprise you.`);
  plan.push(`Watch a short performance video together and ask what they liked about it.`);

  if (submission.instrumentsAtHome.length > 0 && !submission.instrumentsAtHome.includes('not-yet')) {
    plan.push(`Let ${childName} explore the ${primaryInstrument.toLowerCase()} at home with no pressure. Ask them to show you their favorite sound.`);
  } else {
    plan.push(`Try a simple rhythm game: clap or tap along to a favorite song together.`);
  }

  if (band === 'emerging') {
    plan.push(`Focus on fun over structure. Dance parties, singing in the car, or tapping on pots all count.`);
  } else if (band === 'ready-with-support') {
    plan.push(`Talk about what kind of teacher personality might click with ${childName} (silly? calm? energetic?).`);
  } else {
    plan.push(`Research local options and book a trial lesson to see how ${childName} responds to real instruction.`);
  }

  plan.push(`Set aside 5 minutes this week for "music time" — no agenda, just play.`);

  return plan.slice(0, 6);
}

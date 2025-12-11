import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizSubmission {
  id: string;
  parentName: string;
  email: string;
  childName: string;
  phone: string;
  score: number;
  band: string;
  bandLabel: string;
  bandDescription: string;
  primaryInstrument: string;
  secondaryInstruments: string[];
  actionPlan: string[];
  createdAt: string;
  // Quiz answers for lead notification
  pitch: string;
  rhythm: string;
  memory: string;
  emotionalResponse: string;
  hummingSinging: string;
  rhythmPlay: string;
  dancing: string;
  drawnToInstruments: string;
  handlesCorrection: string;
  performerStyle: string;
  focusDuration: string;
  wantsToLearn: string;
  favoriteSongBehavior: string;
  instrumentsAtHome: string[];
}

// Sample data for preview mode
const sampleSubmission: QuizSubmission = {
  id: "preview-123",
  parentName: "Sarah Johnson",
  email: "sarah@example.com",
  childName: "Emma",
  phone: "(555) 123-4567",
  score: 78,
  band: "ready-to-thrive",
  bandLabel: "Ready to Thrive",
  bandDescription: "Emma shows excellent musical readiness! She's likely to thrive with the right teacher and instrument match. Her natural abilities and enthusiasm make this an ideal time to begin structured lessons.",
  primaryInstrument: "Piano",
  secondaryInstruments: ["Guitar", "Voice"],
  actionPlan: [
    "Tonight, play Emma's favorite song and clap along together—watch how she naturally follows the beat.",
    "Try a quick melody echo game: hum a simple tune and see if Emma can hum it back.",
    "Since you have a keyboard at home, let Emma explore the keys freely for 10 minutes—no rules, just play.",
    "Show Emma short video clips of kids playing piano, guitar, and drums. Ask which one looks most fun to her.",
    "Have Emma perform her favorite song for the family—she'll love showing off her musical side!",
    "Book a trial lesson at Best Lesson Ever to see Emma light up with a real instrument in her hands."
  ],
  createdAt: new Date().toISOString(),
  pitch: "yes-on-tune",
  rhythm: "yes",
  memory: "yes",
  emotionalResponse: "yes",
  hummingSinging: "all-the-time",
  rhythmPlay: "constantly",
  dancing: "yes",
  drawnToInstruments: "yes",
  handlesCorrection: "jumps-in",
  performerStyle: "loves-showing",
  focusDuration: "20-plus",
  wantsToLearn: "yes",
  favoriteSongBehavior: "yes",
  instrumentsAtHome: ["keyboard-piano"],
};

// Helper functions for generating email HTML
const answerLabels: Record<string, Record<string, string>> = {
  pitch: { "yes-on-tune": "Yes, mostly on tune", "sometimes": "Sometimes", "not-really": "Not really" },
  rhythm: { "yes": "Yes", "sometimes": "Sometimes", "not-yet": "Not yet" },
  memory: { "yes": "Yes", "sometimes": "Sometimes", "not-really": "Not really" },
  emotionalResponse: { "yes": "Yes", "sometimes": "Sometimes", "not-noticed": "Not noticed" },
  hummingSinging: { "all-the-time": "All the time", "sometimes": "Sometimes", "rarely": "Rarely" },
  rhythmPlay: { "constantly": "Constantly", "sometimes": "Sometimes", "rarely": "Rarely" },
  dancing: { "yes": "Yes", "sometimes": "Sometimes", "no": "No" },
  drawnToInstruments: { "yes": "Yes", "sometimes": "Sometimes", "not-really": "Not really" },
  handlesCorrection: { "jumps-in": "Jumps right in", "needs-encouragement": "Needs encouragement", "frustrated": "Gets frustrated" },
  performerStyle: { "loves-showing": "Loves showing off", "shy-but-tries": "Shy but tries", "nervous": "Very nervous" },
  focusDuration: { "20-plus": "20+ minutes", "10-20": "10-20 minutes", "5-10": "5-10 minutes", "under-5": "Under 5 minutes" },
  wantsToLearn: { "yes": "Yes", "not-yet": "Not yet", "no": "No" },
  favoriteSongBehavior: { "yes": "Yes", "sometimes": "Sometimes", "rarely": "Rarely" },
};

const instrumentsAtHomeLabels: Record<string, string> = {
  "keyboard-piano": "Keyboard/Piano",
  "guitar-ukulele": "Guitar/Ukulele",
  "drums": "Drums",
  "other": "Other instrument",
  "not-yet": "None yet",
};

const getLabel = (field: string, value: string) => answerLabels[field]?.[value] || value;

function generateLeadEmailHtml(submission: QuizSubmission, resultsUrl: string, formattedDate: string): string {
  const instrumentsAtHomeFormatted = submission.instrumentsAtHome
    .map(i => instrumentsAtHomeLabels[i] || i)
    .join(", ");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
        🎵 New Music Readiness Score Submission
      </h1>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
        <p><strong>Parent:</strong> ${submission.parentName}</p>
        <p><strong>Email:</strong> <a href="mailto:${submission.email}">${submission.email}</a></p>
        <p><strong>Phone:</strong> ${submission.phone || "Not provided"}</p>
        <p><strong>Child's Name:</strong> ${submission.childName}</p>
      </div>

      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #065f46; margin-top: 0;">Score Results</h2>
        <p style="font-size: 32px; font-weight: bold; color: #059669; margin: 0;">${submission.score}/100</p>
        <p style="font-size: 18px; color: #065f46; margin: 8px 0 0 0;"><strong>${submission.bandLabel}</strong></p>
      </div>

      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1e40af; margin-top: 0;">Instrument Recommendations</h2>
        <p><strong>Primary:</strong> ${submission.primaryInstrument}</p>
        <p><strong>Also consider:</strong> ${submission.secondaryInstruments.join(", ")}</p>
        <p><strong>Instruments at home:</strong> ${instrumentsAtHomeFormatted}</p>
      </div>

      <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #854d0e; margin-top: 0;">Quiz Answers</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0;"><strong>Pitch:</strong></td><td>${getLabel("pitch", submission.pitch)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Rhythm:</strong></td><td>${getLabel("rhythm", submission.rhythm)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Memory:</strong></td><td>${getLabel("memory", submission.memory)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Emotional response:</strong></td><td>${getLabel("emotionalResponse", submission.emotionalResponse)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Humming/Singing:</strong></td><td>${getLabel("hummingSinging", submission.hummingSinging)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Rhythm play:</strong></td><td>${getLabel("rhythmPlay", submission.rhythmPlay)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Dancing:</strong></td><td>${getLabel("dancing", submission.dancing)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Drawn to instruments:</strong></td><td>${getLabel("drawnToInstruments", submission.drawnToInstruments)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Handles new things:</strong></td><td>${getLabel("handlesCorrection", submission.handlesCorrection)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Performer style:</strong></td><td>${getLabel("performerStyle", submission.performerStyle)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Focus duration:</strong></td><td>${getLabel("focusDuration", submission.focusDuration)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Wants to learn:</strong></td><td>${getLabel("wantsToLearn", submission.wantsToLearn)}</td></tr>
          <tr><td style="padding: 4px 0;"><strong>Favorite song behavior:</strong></td><td>${getLabel("favoriteSongBehavior", submission.favoriteSongBehavior)}</td></tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <a href="${resultsUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Full Results</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">Submitted: ${formattedDate}</p>
    </div>
  `;
}

function generateParentEmailHtml(submission: QuizSubmission, resultsUrl: string, bookingUrl: string): string {
  const actionPlanHtml = submission.actionPlan
    .map(item => `<li style="margin-bottom: 8px;">${item}</li>`)
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">
        ${submission.childName}'s Music Readiness Results Are In!
      </h1>
      
      <p style="font-size: 16px; color: #374151;">Hi ${submission.parentName},</p>
      
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 14px;">Music Readiness Score</p>
        <p style="font-size: 48px; font-weight: bold; color: white; margin: 0;">${submission.score}</p>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">out of 100</p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1e40af; margin-top: 0;">${submission.bandLabel}</h2>
        <p style="color: #374151; line-height: 1.6;">${submission.bandDescription}</p>
      </div>

      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1e40af; margin-top: 0;">Best-Fit Instrument: ${submission.primaryInstrument}</h2>
        <p style="color: #374151;">Also consider: ${submission.secondaryInstruments.join(", ")}</p>
      </div>

      <div style="margin: 24px 0;">
        <h2 style="color: #1a1a1a;">Your Action Plan</h2>
        <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
          ${actionPlanHtml}
        </ul>
      </div>

      <div style="margin: 24px 0;">
        <a href="${resultsUrl}" style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Full Results Online</a>
      </div>

      <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 24px; border-radius: 12px; margin: 32px 0; text-align: center;">
        <h2 style="color: white; margin-top: 0;">Ready to Get Started?</h2>
        <p style="color: rgba(255,255,255,0.9); margin-bottom: 16px;">Book a free trial lesson with Best Lesson Ever!</p>
        <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
          <a href="tel:2819404101" style="display: inline-block; background: white; color: #3b82f6; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; width: 280px; box-sizing: border-box;">📞 Call Us to Book A Free Trial</a>
          <a href="${bookingUrl}" style="display: inline-block; background: transparent; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid white; width: 280px; box-sizing: border-box;">📅 Self Book Your Free Trial</a>
        </div>
        <p style="color: rgba(255,255,255,0.8); margin-top: 12px; font-size: 14px;">281.940.4101</p>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          <strong>Best Lesson Ever!</strong><br>
          Student-focused music lessons that actually stick.<br>
          <a href="https://bestlessonever.com/friendswood" style="color: #3b82f6;">bestlessonever.com/friendswood</a>
        </p>
      </div>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-quiz-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Check for preview mode
    if (body.preview === true) {
      console.log("Preview mode requested, type:", body.type);
      // Allow overriding sample data (e.g., with AI-generated action plan)
      const submission = body.sampleOverride 
        ? { ...sampleSubmission, ...body.sampleOverride }
        : sampleSubmission;
      const baseUrl = "https://ddzzdwzxpssittevvpdi.lovable.app";
      const resultsUrl = `${baseUrl}/results/${submission.id}`;
      const bookingUrl = "https://bestlessonever.com/book";
      const formattedDate = new Date(submission.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      if (body.type === "lead") {
        return new Response(
          JSON.stringify({ html: generateLeadEmailHtml(submission, resultsUrl, formattedDate) }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        return new Response(
          JSON.stringify({ html: generateParentEmailHtml(submission, resultsUrl, bookingUrl) }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Normal email sending mode
    const submission: QuizSubmission = body;
    console.log("Received submission for:", submission.childName);

    // Use environment variable or default to production domain
    const baseUrl = Deno.env.get("APP_URL") || "https://ddzzdwzxpssittevvpdi.lovable.app";
    const resultsUrl = `${baseUrl}/results/${submission.id}`;
    const bookingUrl = "https://bestlessonever.com/book";
    const formattedDate = new Date(submission.createdAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 1. Send lead notification email to bestlessoninfo@gmail.com
    const leadEmailHtml = generateLeadEmailHtml(submission, resultsUrl, formattedDate);

    console.log("Sending lead notification email...");
    const leadEmailResponse = await resend.emails.send({
      from: "Best Lesson Ever <info@bestlessonever.com>",
      to: ["bestlessoninfo@gmail.com"],
      subject: `New Lead: ${submission.childName} scored ${submission.score}/100`,
      html: leadEmailHtml,
    });
    console.log("Lead email sent:", leadEmailResponse);

    // 2. Send results email to parent
    const parentEmailHtml = generateParentEmailHtml(submission, resultsUrl, bookingUrl);

    console.log("Sending parent results email...");
    const parentEmailResponse = await resend.emails.send({
      from: "Best Lesson Ever <info@bestlessonever.com>",
      to: [submission.email],
      subject: `${submission.childName}'s Music Readiness Results Are In!`,
      html: parentEmailHtml,
    });
    console.log("Parent email sent:", parentEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadEmail: leadEmailResponse, 
        parentEmail: parentEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quiz-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

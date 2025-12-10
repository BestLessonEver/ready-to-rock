import { useState } from "react";
import { Button } from "@/components/ui/button";

const sampleData = {
  parentName: "Sarah",
  childName: "Emma",
  email: "sarah@example.com",
  phone: "(555) 123-4567",
  cityZip: "Austin, TX 78701",
  score: 72,
  band: "ready-with-support",
  bandLabel: "Ready With Support",
  bandDescription: "Emma is ready for music lessons with the right approach! With a fun, encouraging teacher who matches her personality, she'll build skills and confidence quickly.",
  primaryInstrument: "Piano",
  secondaryInstruments: ["Guitar", "Voice"],
  actionPlan: [
    "Tonight, play Emma's favorite song and clap or sing along together—this is music class in disguise.",
    "Try a quick rhythm duel: you clap a pattern, Emma echoes it back. See how many rounds you can go!",
    "Since you have a piano at home, let Emma explore the keys for 5 minutes with no rules—just play.",
    "Show Emma short clips of kids playing piano, guitar, and drums. Ask: 'Which one looks the most fun?'",
    "When Emma tries something new, celebrate the attempt, not just the result. Confidence comes from trying.",
    "Book a trial lesson at Best Lesson Ever to see how Emma connects with a real teacher."
  ],
  resultsUrl: "https://bestlessonever.com/readiness/results/abc123",
  bookingUrl: "https://bestlessonever.com/book"
};

function LeadEmailTemplate() {
  const { parentName, childName, email, phone, cityZip, score, bandLabel, primaryInstrument, secondaryInstruments, actionPlan } = sampleData;
  
  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#ffffff" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "32px 24px", textAlign: "center" as const }}>
        <h1 style={{ color: "#ffffff", fontSize: 24, margin: 0, fontWeight: 600 }}>New Quiz Submission</h1>
        <p style={{ color: "#a0a0a0", fontSize: 14, margin: "8px 0 0" }}>Music Readiness Score</p>
      </div>
      
      <div style={{ padding: "32px 24px" }}>
        <div style={{ backgroundColor: "#f8f9fa", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, color: "#1a1a2e", margin: "0 0 16px", fontWeight: 600 }}>Contact Information</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#666", fontSize: 14 }}>Parent Name:</td>
                <td style={{ padding: "8px 0", color: "#1a1a2e", fontSize: 14, fontWeight: 500 }}>{parentName}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666", fontSize: 14 }}>Email:</td>
                <td style={{ padding: "8px 0", color: "#1a1a2e", fontSize: 14, fontWeight: 500 }}>{email}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666", fontSize: 14 }}>Phone:</td>
                <td style={{ padding: "8px 0", color: "#1a1a2e", fontSize: 14, fontWeight: 500 }}>{phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666", fontSize: 14 }}>Location:</td>
                <td style={{ padding: "8px 0", color: "#1a1a2e", fontSize: 14, fontWeight: 500 }}>{cityZip || "Not provided"}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666", fontSize: 14 }}>Child's Name:</td>
                <td style={{ padding: "8px 0", color: "#1a1a2e", fontSize: 14, fontWeight: 500 }}>{childName}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ backgroundColor: "#f0f7ff", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" as const }}>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>Readiness Score</p>
          <p style={{ fontSize: 48, fontWeight: 700, color: "#2563eb", margin: "0 0 8px" }}>{score}</p>
          <p style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "6px 16px", borderRadius: 20, display: "inline-block", fontSize: 14, fontWeight: 500 }}>{bandLabel}</p>
        </div>

        <div style={{ backgroundColor: "#f8f9fa", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, color: "#1a1a2e", margin: "0 0 16px", fontWeight: 600 }}>Instrument Recommendations</h2>
          <p style={{ margin: "0 0 8px", fontSize: 14 }}>
            <strong style={{ color: "#1a1a2e" }}>Primary:</strong>{" "}
            <span style={{ color: "#2563eb", fontWeight: 500 }}>{primaryInstrument}</span>
          </p>
          {secondaryInstruments && secondaryInstruments.length > 0 && (
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong style={{ color: "#1a1a2e" }}>Also consider:</strong>{" "}
              <span style={{ color: "#666" }}>{secondaryInstruments.join(", ")}</span>
            </p>
          )}
        </div>

        <div style={{ backgroundColor: "#f8f9fa", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, color: "#1a1a2e", margin: "0 0 16px", fontWeight: 600 }}>Action Plan</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {actionPlan.map((item, i) => (
              <li key={i} style={{ color: "#444", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", padding: "24px", textAlign: "center" as const }}>
        <p style={{ color: "#666", fontSize: 12, margin: 0 }}>Best Lesson Ever • Music Readiness Score</p>
      </div>
    </div>
  );
}

function ParentEmailTemplate() {
  const { parentName, childName, score, bandLabel, bandDescription, primaryInstrument, secondaryInstruments, actionPlan, resultsUrl, bookingUrl } = sampleData;
  
  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#ffffff" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "40px 24px", textAlign: "center" as const }}>
        <h1 style={{ color: "#ffffff", fontSize: 28, margin: 0, fontWeight: 600 }}>{childName}'s Music Readiness Results</h1>
        <p style={{ color: "#a0a0a0", fontSize: 16, margin: "12px 0 0" }}>Here's what we discovered</p>
      </div>
      
      <div style={{ padding: "32px 24px" }}>
        <p style={{ fontSize: 16, color: "#444", lineHeight: 1.6, margin: "0 0 24px" }}>
          Hi {parentName},
        </p>
        <p style={{ fontSize: 16, color: "#444", lineHeight: 1.6, margin: "0 0 32px" }}>
          Thank you for completing the Music Readiness Score quiz! Here are {childName}'s personalized results and your action plan.
        </p>

        <div style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)", borderRadius: 16, padding: 32, marginBottom: 32, textAlign: "center" as const }}>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: 1 }}>Readiness Score</p>
          <p style={{ fontSize: 64, fontWeight: 700, color: "#2563eb", margin: "0 0 12px", lineHeight: 1 }}>{score}</p>
          <p style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "8px 20px", borderRadius: 24, display: "inline-block", fontSize: 16, fontWeight: 600 }}>{bandLabel}</p>
          <p style={{ color: "#555", fontSize: 15, margin: "20px 0 0", lineHeight: 1.6 }}>{bandDescription}</p>
        </div>

        <div style={{ backgroundColor: "#f8f9fa", borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, color: "#1a1a2e", margin: "0 0 20px", fontWeight: 600 }}>🎸 Recommended Instruments</h2>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 20, marginBottom: 16, border: "2px solid #2563eb" }}>
            <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: 1 }}>Best Match</p>
            <p style={{ color: "#2563eb", fontSize: 24, fontWeight: 600, margin: 0 }}>{primaryInstrument}</p>
          </div>
          {secondaryInstruments && secondaryInstruments.length > 0 && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16 }}>
              <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: 1 }}>Also Great Options</p>
              <p style={{ color: "#1a1a2e", fontSize: 18, fontWeight: 500, margin: 0 }}>{secondaryInstruments.join(" • ")}</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: "#fffbeb", borderRadius: 16, padding: 28, marginBottom: 32, border: "1px solid #fcd34d" }}>
          <h2 style={{ fontSize: 20, color: "#1a1a2e", margin: "0 0 20px", fontWeight: 600 }}>✨ Your Action Plan</h2>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px" }}>Start {childName}'s musical journey with these personalized steps:</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {actionPlan.map((item, i) => (
              <li key={i} style={{ color: "#444", fontSize: 15, marginBottom: 12, lineHeight: 1.6, paddingLeft: 8 }}>{item}</li>
            ))}
          </ol>
        </div>

        <div style={{ textAlign: "center" as const, marginBottom: 32 }}>
          <a href={resultsUrl} style={{ display: "inline-block", backgroundColor: "#f8f9fa", color: "#2563eb", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
            View Full Results Online →
          </a>
        </div>

        <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", borderRadius: 16, padding: 32, textAlign: "center" as const }}>
          <h2 style={{ color: "#ffffff", fontSize: 22, margin: "0 0 12px", fontWeight: 600 }}>Ready to Start?</h2>
          <p style={{ color: "#e0e7ff", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
            Book a free lesson planning call to find the perfect teacher match for {childName}.
          </p>
          <a href={bookingUrl} style={{ display: "inline-block", backgroundColor: "#ffffff", color: "#2563eb", padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, fontWeight: 600 }}>
            Book a Lesson Planning Call
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", padding: "32px 24px", textAlign: "center" as const }}>
        <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Best Lesson Ever</p>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 16px" }}>Modern music lessons, matched to your child</p>
        <a href="https://bestlessonever.com" style={{ color: "#2563eb", fontSize: 13, textDecoration: "none" }}>bestlessonever.com</a>
      </div>
    </div>
  );
}

export default function EmailPreview() {
  const [view, setView] = useState<"lead" | "parent">("parent");

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">Email Preview</h1>
          <div className="flex gap-2">
            <Button
              variant={view === "parent" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("parent")}
            >
              Parent Email
            </Button>
            <Button
              variant={view === "lead" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("lead")}
            >
              Lead Email
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {view === "lead" ? <LeadEmailTemplate /> : <ParentEmailTemplate />}
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Edit the templates in <code className="bg-muted px-1.5 py-0.5 rounded">supabase/functions/send-quiz-emails/index.ts</code>
        </p>
      </div>
    </div>
  );
}

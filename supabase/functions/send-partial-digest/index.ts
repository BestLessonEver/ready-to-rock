import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEAM_EMAIL = "bestlessoninfo@gmail.com";
const TOTAL_STEPS = 15;

interface PartialSubmission {
  id: string;
  parent_name: string;
  email: string;
  phone: string | null;
  last_step: number | null;
  created_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function generateDigestHtml(submissions: PartialSubmission[]): string {
  const rows = submissions.map((sub, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-weight: 600;">${index + 1}</td>
      <td style="padding: 12px 8px;">
        <strong>${sub.parent_name}</strong><br/>
        <a href="mailto:${sub.email}" style="color: #2563eb;">${sub.email}</a>
      </td>
      <td style="padding: 12px 8px;">${sub.phone || 'Not provided'}</td>
      <td style="padding: 12px 8px;">Step ${sub.last_step || 6} of ${TOTAL_STEPS}</td>
      <td style="padding: 12px 8px; color: #6b7280; font-size: 14px;">${formatDate(sub.created_at)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px 32px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📋 Daily Partial Quiz Digest</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${submissions.length} new lead${submissions.length > 1 ? 's' : ''} started but didn't complete the quiz</p>
        </div>
        
        <div style="padding: 24px 32px;">
          <p style="color: #374151; margin: 0 0 20px 0;">
            The following parents entered their email in the Music Readiness Quiz but didn't finish. Consider reaching out!
          </p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f3f4f6; text-align: left;">
                <th style="padding: 12px 8px; font-weight: 600;">#</th>
                <th style="padding: 12px 8px; font-weight: 600;">Contact</th>
                <th style="padding: 12px 8px; font-weight: 600;">Phone</th>
                <th style="padding: 12px 8px; font-weight: 600;">Progress</th>
                <th style="padding: 12px 8px; font-weight: 600;">Started</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          
          <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 Tip:</strong> These leads showed interest but may have gotten distracted. A quick follow-up email or call could help them complete their child's assessment!
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Music Readiness Quiz by Best Lesson Ever
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting partial digest check...");

  try {
    // Initialize Supabase client with service role for database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query partial submissions that haven't been included in a digest yet
    const { data: partialSubmissions, error: queryError } = await supabase
      .from("submissions")
      .select("id, parent_name, email, phone, last_step, created_at")
      .eq("status", "partial")
      .is("digest_sent_at", null)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Error querying partial submissions:", queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    console.log(`Found ${partialSubmissions?.length || 0} new partial submissions`);

    // If no new partial submissions, return early without sending email
    if (!partialSubmissions || partialSubmissions.length === 0) {
      console.log("No new partial submissions - skipping email");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No new partial submissions to report",
          count: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate and send the digest email
    const emailHtml = generateDigestHtml(partialSubmissions);

    const emailResponse = await resend.emails.send({
      from: "Music Readiness Quiz <info@bestlessonever.com>",
      to: [TEAM_EMAIL],
      subject: `Daily Partial Quiz Digest - ${partialSubmissions.length} New Lead${partialSubmissions.length > 1 ? 's' : ''}`,
      html: emailHtml,
    });

    console.log("Digest email sent successfully:", emailResponse);

    // Update all included submissions to mark them as processed
    const submissionIds = partialSubmissions.map(s => s.id);
    const { error: updateError } = await supabase
      .from("submissions")
      .update({ digest_sent_at: new Date().toISOString() })
      .in("id", submissionIds);

    if (updateError) {
      console.error("Error updating digest_sent_at:", updateError);
      // Don't throw - email was already sent successfully
    } else {
      console.log(`Updated digest_sent_at for ${submissionIds.length} submissions`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Digest sent with ${partialSubmissions.length} partial submissions`,
        count: partialSubmissions.length
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-partial-digest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { supabase } from "@/integrations/supabase/client";
import { Submission } from './scoring';

const STORAGE_KEY = 'music_readiness_submissions';

// Save partial submission when email is captured (step 6)
export async function savePartialSubmission(data: {
  parentName: string;
  email: string;
  lastStep: number;
}): Promise<string | null> {
  try {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('submissions').insert([{
      id,
      email: data.email,
      parent_name: data.parentName,
      child_name: 'Unknown', // Placeholder until they complete
      phone: null,
      city_zip: null,
      score: 0,
      band: 'unknown',
      band_label: 'Incomplete',
      band_description: 'Quiz not completed',
      primary_instrument: 'Unknown',
      secondary_instruments: [],
      action_plan: [],
      answers: { parentName: data.parentName, email: data.email },
      status: 'partial',
      last_step: data.lastStep,
    }]);

    if (error) {
      console.error("Error saving partial submission:", error);
      return null;
    }
    console.log("Partial lead saved:", id);
    return id;
  } catch (err) {
    console.error("Failed to save partial submission:", err);
    return null;
  }
}

// Update partial submission to complete
export async function updateSubmissionToComplete(id: string, submission: Submission): Promise<boolean> {
  try {
    const { error } = await supabase.from('submissions').update({
      email: submission.email,
      parent_name: submission.parentName,
      child_name: submission.childName,
      child_age: submission.childAge || null,
      phone: submission.phone || null,
      score: submission.score,
      band: submission.band,
      band_label: submission.bandLabel,
      band_description: submission.bandDescription,
      primary_instrument: submission.primaryInstrument,
      secondary_instruments: submission.secondaryInstruments,
      action_plan: submission.actionPlan,
      answers: JSON.parse(JSON.stringify(submission)),
      status: 'complete',
      last_step: 15,
    }).eq('id', id);

    if (error) {
      console.error("Error updating submission:", error);
      return false;
    }
    console.log("Submission completed:", id);
    return true;
  } catch (err) {
    console.error("Failed to update submission:", err);
    return false;
  }
}

// Save to database (new complete submission)
export async function saveSubmissionToDb(submission: Submission): Promise<boolean> {
  try {
    const { error } = await supabase.from('submissions').insert([{
      id: submission.id,
      email: submission.email,
      parent_name: submission.parentName,
      child_name: submission.childName,
      child_age: submission.childAge || null,
      phone: submission.phone || null,
      city_zip: null,
      score: submission.score,
      band: submission.band,
      band_label: submission.bandLabel,
      band_description: submission.bandDescription,
      primary_instrument: submission.primaryInstrument,
      secondary_instruments: submission.secondaryInstruments,
      action_plan: submission.actionPlan,
      answers: JSON.parse(JSON.stringify(submission)),
      status: 'complete',
      last_step: 15,
    }]);

    if (error) {
      console.error("Error saving to database:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to save submission to database:", err);
    return false;
  }
}

// Fetch from database
export async function getSubmissionFromDb(id: string): Promise<Submission | null> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching from database:", error);
      return null;
    }

    // Map database record back to Submission type
    const answers = data.answers as Record<string, unknown>;
    return {
      id: data.id,
      parentName: data.parent_name,
      email: data.email,
      childName: data.child_name,
      childAge: (data as Record<string, unknown>).child_age as string || '',
      phone: data.phone || '',
      score: data.score,
      band: data.band as Submission['band'],
      bandLabel: data.band_label,
      bandDescription: data.band_description,
      primaryInstrument: data.primary_instrument,
      secondaryInstruments: data.secondary_instruments || [],
      actionPlan: data.action_plan || [],
      createdAt: data.created_at,
      source: 'Music Readiness Score',
      // Restore quiz answers from stored answers
      pitch: (answers?.pitch as string) || '',
      rhythm: (answers?.rhythm as string) || '',
      memory: (answers?.memory as string) || '',
      emotionalResponse: (answers?.emotionalResponse as string) || '',
      hummingSinging: (answers?.hummingSinging as string) || '',
      rhythmPlay: (answers?.rhythmPlay as string) || '',
      dancing: (answers?.dancing as string) || '',
      drawnToInstruments: (answers?.drawnToInstruments as string) || '',
      performerStyle: (answers?.performerStyle as string) || '',
      focusDuration: (answers?.focusDuration as string) || '',
      wantsToLearn: (answers?.wantsToLearn as string) || '',
      instrumentsAtHome: (answers?.instrumentsAtHome as string[]) || [],
    };
  } catch (err) {
    console.error("Failed to fetch submission from database:", err);
    return null;
  }
}

// Legacy localStorage functions for backwards compatibility
export function saveSubmission(submission: Submission): void {
  const existing = getAllSubmissions();
  existing.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getSubmission(id: string): Submission | null {
  const submissions = getAllSubmissions();
  return submissions.find(s => s.id === id) || null;
}

export function getAllSubmissions(): Submission[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

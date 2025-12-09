import { Submission } from './scoring';

const STORAGE_KEY = 'music_readiness_submissions';

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

// TODO: Replace with database integration when Lovable Cloud is enabled
// This is where you would:
// 1. Insert into Supabase 'submissions' table
// 2. Send confirmation email via edge function
// 3. Trigger any webhooks or notifications

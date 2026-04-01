/**
 * types/academy-events.ts
 */

export type LearningEventType = 
  | 'favorite_added'
  | 'favorite_removed'
  | 'status_changed'
  | 'quiz_answered'
  | 'quiz_reset'
  | 'academy_reset';

export interface UserLearningEvent {
  id: string;
  user_id: string;
  academy_id: string;
  event_type: LearningEventType;
  source: string | null;
  entry_key: string | null;
  status_from: string | null;
  status_to: string | null;
  quiz_correct_delta: number;
  quiz_incorrect_delta: number;
  quiz_total_delta: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

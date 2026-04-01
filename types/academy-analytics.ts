/**
 * types/academy-analytics.ts
 */

export interface DateRangeInput {
  from: string; // DD/MM/YYYY
  to: string;   // DD/MM/YYYY
}

export interface AcademyAnalyticsSummary {
  academyId: string;
  userId: string;
  membershipStartedAt: string;
  effectiveFrom: string;
  effectiveTo: string;
  favoritesAdded: number;
  favoritesRemoved: number;
  statusChanges: number;
  wordsSeenInRange: number;
  wordsLearnedInRange: number;
  quizAnswered: number;
  quizCorrect: number;
  quizIncorrect: number;
  academyResets: number;
  quizResets: number;
}

export interface StudentAnalyticsSummary extends AcademyAnalyticsSummary {}

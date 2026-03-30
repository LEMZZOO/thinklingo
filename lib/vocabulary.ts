import vocabularyData from '../data/vocabulary.json';
import { VocabularyEntry } from '@/types';

export const vocabulary: VocabularyEntry[] = vocabularyData as VocabularyEntry[];

export function getAllVocabulary(): VocabularyEntry[] {
  return vocabulary;
}

export function getVocabularyByCategory(category: string): VocabularyEntry[] {
  return vocabulary.filter(entry => entry.category === category);
}

export function getVocabularyByDifficulty(difficulty: string): VocabularyEntry[] {
  return vocabulary.filter(entry => entry.difficulty === difficulty);
}

export function searchVocabulary(query: string): VocabularyEntry[] {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return vocabulary;
  
  return vocabulary.filter(entry => 
    entry.english_word.toLowerCase().includes(normQuery) ||
    entry.spanish_translation.toLowerCase().includes(normQuery) ||
    entry.example_sentence_en.toLowerCase().includes(normQuery) ||
    entry.example_sentence_es.toLowerCase().includes(normQuery)
  );
}

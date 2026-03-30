export interface VocabularyEntry {
  id: string;
  english_word: string;
  spanish_translation: string;
  example_sentence_en: string;
  example_sentence_es: string;
  category: string;
  difficulty: "easy" | "medium" | "advanced";
  tags: string[];
  note?: string;
}

export type CategoryCount = Record<string, number>;

export interface Academy {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  headline: string | null;
  tagline: string | null;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  is_active: boolean;
  uses_custom_vocabulary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo que refleja exactamente una fila de la tabla `academy_vocabulary` en Supabase.
 * No está acoplado a VocabularyEntry (tipo del JSON).
 */
export interface AcademyVocabularyRow {
  id: string;
  academy_id: string;
  english_word: string;
  spanish_translation: string;
  example_sentence_en: string | null;
  example_sentence_es: string | null;
  category: string | null;
  difficulty: 'easy' | 'medium' | 'advanced';
  tags: string[];
  note: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
}

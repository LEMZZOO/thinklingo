-- ==========================================
-- FASE 1: ACADEMY MEMBERSHIPS & RLS
-- ==========================================

-- 1. Tabla conectora Pura
-- NOTA: La tabla ya existe en el schema real referenciando a public.profiles(id)
-- e incluyendo 'is_active' y roles correctos ('academy_admin', 'teacher', 'student').
-- No redefinimos la tabla aquí para evitar errores.

-- Habilitar Row Level Security
ALTER TABLE public.academy_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Seguridad (RLS)
DROP POLICY IF EXISTS "Students can view their own memberships" ON public.academy_memberships;
CREATE POLICY "Students can view their own memberships" 
ON public.academy_memberships
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Solo administradores globales/service_role (tu backend de Vercel/CLI) 
-- pueden crear filas. Nadie más debería poder insertar a mano.

-- ==========================================
-- FASE 2 PREVIEW
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    source TEXT CHECK (source IN ('json', 'academy_db')) NOT NULL,
    entry_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, academy_id, source, entry_key)
);
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique 
ON public.user_favorites (user_id, academy_id, source, entry_key);

-- Políticas de RLS explícitas para favoritos
DROP POLICY IF EXISTS "Users can select their own favorites" ON public.user_favorites;
CREATE POLICY "Users can select their own favorites" 
ON public.user_favorites FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id AND am.is_active = true
));


CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    source TEXT CHECK (source IN ('json', 'academy_db')) NOT NULL,
    entry_key TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'seen', 'learned')) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, academy_id, source, entry_key)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_unique 
ON public.user_progress (user_id, academy_id, source, entry_key);

-- Políticas de RLS explícitas para progreso
DROP POLICY IF EXISTS "Users can select their own progress" ON public.user_progress;
CREATE POLICY "Users can select their own progress" 
ON public.user_progress FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress" 
ON public.user_progress FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress" 
ON public.user_progress FOR UPDATE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id AND am.is_active = true
))
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_progress;
CREATE POLICY "Users can delete their own progress" 
ON public.user_progress FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id AND am.is_active = true
));

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger general para updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- FASE 2: STATS AGREGADOS (Quiz)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_academy_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    quiz_correct integer not null default 0,
    quiz_incorrect integer not null default 0,
    quiz_total integer not null default 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, academy_id)
);
ALTER TABLE public.user_academy_stats ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_academy_stats_unique 
ON public.user_academy_stats (user_id, academy_id);

DROP POLICY IF EXISTS "Users can select their own quiz stats" ON public.user_academy_stats;
CREATE POLICY "Users can select their own quiz stats" 
ON public.user_academy_stats FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can insert their own quiz stats" ON public.user_academy_stats;
CREATE POLICY "Users can insert their own quiz stats" 
ON public.user_academy_stats FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can update their own quiz stats" ON public.user_academy_stats;
CREATE POLICY "Users can update their own quiz stats" 
ON public.user_academy_stats FOR UPDATE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id AND am.is_active = true
))
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id AND am.is_active = true
));

DROP POLICY IF EXISTS "Users can delete their own quiz stats" ON public.user_academy_stats;
CREATE POLICY "Users can delete their own quiz stats" 
ON public.user_academy_stats FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id AND am.is_active = true
));

DROP TRIGGER IF EXISTS update_user_academy_stats_updated_at ON public.user_academy_stats;
CREATE TRIGGER update_user_academy_stats_updated_at
BEFORE UPDATE ON public.user_academy_stats
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- FASE 2: RPC PARA INCREMENTO ATÓMICO DE STATS
-- ==========================================

CREATE OR REPLACE FUNCTION public.increment_quiz_stats(
  p_academy_id UUID,
  p_is_correct BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar sesión
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validar acceso a la academia (debe estar activo)
  IF NOT EXISTS (
    SELECT 1 FROM public.academy_memberships
    WHERE user_id = auth.uid() 
      AND academy_id = p_academy_id 
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied or inactive membership';
  END IF;

  -- Upsert atómico
  INSERT INTO public.user_academy_stats (
    user_id,
    academy_id,
    quiz_correct,
    quiz_incorrect,
    quiz_total,
    updated_at
  )
  VALUES (
    auth.uid(),
    p_academy_id,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    CASE WHEN NOT p_is_correct THEN 1 ELSE 0 END,
    1,
    NOW()
  )
  ON CONFLICT (user_id, academy_id)
  DO UPDATE SET
    quiz_correct = public.user_academy_stats.quiz_correct + EXCLUDED.quiz_correct,
    quiz_incorrect = public.user_academy_stats.quiz_incorrect + EXCLUDED.quiz_incorrect,
    quiz_total = public.user_academy_stats.quiz_total + 1,
    updated_at = NOW();
END;
$$;

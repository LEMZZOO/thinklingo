-- ==========================================
-- FASE 1: ACADEMY MEMBERSHIPS & RLS
-- ==========================================

-- 1. Tabla conectora Pura
CREATE TABLE IF NOT EXISTS public.academy_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Garantiza que un usuario no pueda tener mas de una fila en la misma academia
    UNIQUE(user_id, academy_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.academy_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Seguridad (RLS)
-- Cualquier alumno autenticado puede leer sus propias membresías.
CREATE POLICY "Students can view their own memberships" 
ON public.academy_memberships
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Solo administradores globales/service_role (tu backend de Vercel/CLI) 
-- pueden crear filas. Nadie más debería poder insertar a mano.
-- Esto protege tu modelo de negocio de "Registros Libres".
-- No hay Póliticas de INSERT/UPDATE publicas/authenticated. Solo Superadmin escapa RLS.

-- (Nota funcional): 
-- Si tienes un trigger previo en auth.users, el alta manual del profesor 
-- se realizaría usando supabase.auth.admin.createUser().

-- ==========================================
-- FASE 2 PREVIEW (Para cuando se active persistencia de progreso)
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

-- Políticas de RLS explícitas para favoritos
CREATE POLICY "Users can select their own favorites" 
ON public.user_favorites FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id
));

CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id
));

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_favorites.academy_id
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

-- Políticas de RLS explícitas para progreso
CREATE POLICY "Users can select their own progress" 
ON public.user_progress FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id
));

CREATE POLICY "Users can insert their own progress" 
ON public.user_progress FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id
));

CREATE POLICY "Users can update their own progress" 
ON public.user_progress FOR UPDATE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id
))
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id
));

CREATE POLICY "Users can delete their own progress" 
ON public.user_progress FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_progress.academy_id
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
    quiz_correct_count INTEGER DEFAULT 0,
    quiz_incorrect_count INTEGER DEFAULT 0,
    quiz_total_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, academy_id)
);
ALTER TABLE public.user_academy_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own quiz stats" 
ON public.user_academy_stats FOR SELECT TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id
));

CREATE POLICY "Users can insert their own quiz stats" 
ON public.user_academy_stats FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id
));

CREATE POLICY "Users can update their own quiz stats" 
ON public.user_academy_stats FOR UPDATE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id
))
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id
));

CREATE POLICY "Users can delete their own quiz stats" 
ON public.user_academy_stats FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.academy_memberships am 
  WHERE am.user_id = auth.uid() AND am.academy_id = user_academy_stats.academy_id
));

CREATE TRIGGER update_user_academy_stats_updated_at
BEFORE UPDATE ON public.user_academy_stats
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

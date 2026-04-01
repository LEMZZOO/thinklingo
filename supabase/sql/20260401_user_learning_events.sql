-- supabase/sql/20260401_user_learning_events.sql

-- Crear tabla de eventos históricos
CREATE TABLE IF NOT EXISTS public.user_learning_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    academy_id uuid not null references public.academies(id),
    event_type text not null,
    source text null,
    entry_key text null,
    status_from text null,
    status_to text null,
    quiz_correct_delta integer not null default 0,
    quiz_incorrect_delta integer not null default 0,
    quiz_total_delta integer not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    CONSTRAINT event_type_not_empty CHECK (event_type <> '')
);

-- Índices para analítica por usuario/academia/tipo/fecha
CREATE INDEX IF NOT EXISTS idx_learning_events_academy_user_date ON public.user_learning_events (academy_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_academy_date ON public.user_learning_events (academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_date ON public.user_learning_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_type_date ON public.user_learning_events (event_type, created_at DESC);

-- RLS
ALTER TABLE public.user_learning_events ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Propio usuario + membresía activa
CREATE POLICY "Users can view their own learning events"
ON public.user_learning_events
FOR SELECT
USING (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.academy_memberships
        WHERE user_id = auth.uid()
        AND academy_id = user_learning_events.academy_id
        AND is_active = true
    )
);

-- Política INSERT: Propio usuario + membresía activa
-- Corregida para evitar ambigüedad en la comparación de academy_id
CREATE POLICY "Users can insert their own learning events"
ON public.user_learning_events
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.academy_memberships AS am
        WHERE am.user_id = auth.uid()
        AND am.academy_id = user_learning_events.academy_id
        AND am.is_active = true
    )
);

-- Comentario de referencia temporal
COMMENT ON TABLE public.user_learning_events IS 'Histórico de actividad. Fecha de alta oficial en academy_memberships.created_at';

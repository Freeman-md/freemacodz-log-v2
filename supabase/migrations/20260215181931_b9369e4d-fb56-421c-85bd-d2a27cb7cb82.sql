
-- Create weeks table
CREATE TABLE public.weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  primary_evidence JSONB NOT NULL DEFAULT '{"title":"","description":"","links":"","defined":false,"built":false,"documented":false,"link_added":false}'::jsonb,
  secondary_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  weekly_focus TEXT NOT NULL DEFAULT '',
  weekly_focus_constraints TEXT NOT NULL DEFAULT '',
  open_source_title TEXT NOT NULL DEFAULT '',
  open_source_repo TEXT NOT NULL DEFAULT '',
  open_source_completed BOOLEAN NOT NULL DEFAULT false,
  skill_drill_1 BOOLEAN NOT NULL DEFAULT false,
  skill_drill_2 BOOLEAN NOT NULL DEFAULT false,
  skill_drill_3 BOOLEAN NOT NULL DEFAULT false,
  applications_completed BOOLEAN NOT NULL DEFAULT false,
  applications_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weeks" ON public.weeks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weeks" ON public.weeks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weeks" ON public.weeks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weeks" ON public.weeks FOR DELETE USING (auth.uid() = user_id);

-- Create daily_entries table
CREATE TABLE public.daily_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  day_date DATE NOT NULL,
  anchors JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_commitment_completed BOOLEAN NOT NULL DEFAULT false,
  skill_drill_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_id, day_of_week)
);

ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" ON public.daily_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.daily_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.daily_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.daily_entries FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_weeks_updated_at BEFORE UPDATE ON public.weeks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { WeekRow, DailyEntryRow, getDefaultAnchors } from '@/lib/types';
import { startOfWeek, format, addDays } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

function getMonday(): string {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function useCurrentWeek() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mondayStr = getMonday();

  const weekQuery = useQuery({
    queryKey: ['current-week', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Try to get existing week
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('week_start', mondayStr)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as WeekRow;

      // Create new week
      const { data: newWeek, error: insertError } = await supabase
        .from('weeks')
        .insert({ user_id: user!.id, week_start: mondayStr, is_current: true })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create daily entries
      const entries = Array.from({ length: 7 }, (_, i) => ({
        user_id: user!.id,
        week_id: newWeek.id,
        day_of_week: i,
        day_date: format(addDays(new Date(mondayStr), i), 'yyyy-MM-dd'),
        anchors: getDefaultAnchors(i) as unknown as Json,
      }));

      await supabase.from('daily_entries').insert(entries);

      return newWeek as unknown as WeekRow;
    },
  });

  const dailyQuery = useQuery({
    queryKey: ['daily-entries', weekQuery.data?.id],
    enabled: !!weekQuery.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('week_id', weekQuery.data!.id)
        .order('day_of_week');
      if (error) throw error;
      return data as unknown as DailyEntryRow[];
    },
  });

  const updateWeek = useMutation({
    mutationFn: async (updates: Partial<WeekRow>) => {
      const { error } = await supabase
        .from('weeks')
        .update(updates as any)
        .eq('id', weekQuery.data!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['current-week'] }),
  });

  const updateDailyEntry = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from('daily_entries')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-entries'] }),
  });

  return { week: weekQuery.data, dailyEntries: dailyQuery.data, loading: weekQuery.isLoading, updateWeek, updateDailyEntry };
}

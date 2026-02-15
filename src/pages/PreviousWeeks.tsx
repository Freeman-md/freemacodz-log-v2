import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { WeekRow, PrimaryEvidence, AnchorBlock } from '@/lib/types';

export default function PreviousWeeks() {
  const { user } = useAuth();

  const { data: weeks, isLoading } = useQuery({
    queryKey: ['all-weeks', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('user_id', user!.id)
        .order('week_start', { ascending: false });
      if (error) throw error;
      return data as unknown as WeekRow[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Previous Weeks</h1>
      {!weeks?.length ? (
        <p className="text-sm text-muted-foreground">No weeks yet.</p>
      ) : (
        <div className="space-y-2">
          {weeks.map((w) => {
            const monday = new Date(w.week_start);
            const sunday = addDays(monday, 6);
            const range = `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d, yyyy')}`;
            const evidence = w.primary_evidence as PrimaryEvidence;
            const evidenceCount = [evidence.defined, evidence.built, evidence.documented, evidence.link_added].filter(Boolean).length;

            return (
              <Link
                key={w.id}
                to={`/week/${w.id}`}
                className="block border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range}</span>
                  {w.is_current && <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded">Current</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-x-3">
                  <span>Evidence: {evidenceCount}/4</span>
                  <span>OS: {w.open_source_completed ? '✓' : '–'}</span>
                  <span>Drills: {[w.skill_drill_1, w.skill_drill_2, w.skill_drill_3].filter(Boolean).length}/3</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

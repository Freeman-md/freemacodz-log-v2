import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WeekRow, DailyEntryRow, AnchorBlock, PrimaryEvidence, DAY_NAMES, dayHasCommitment, dayHasSkillDrill, getCommitmentMinutes } from '@/lib/types';
import { EvidenceCard } from '@/components/EvidenceCard';
import { AnchorBlockCard } from '@/components/AnchorBlockCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export default function WeekDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: week, isLoading } = useQuery({
    queryKey: ['week', id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('weeks').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as unknown as WeekRow;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ['daily-entries-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('daily_entries').select('*').eq('week_id', id!).order('day_of_week');
      if (error) throw error;
      return data as unknown as DailyEntryRow[];
    },
  });

  const updateWeek = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from('weeks').update(updates).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['week', id] });
      toast.success('Saved');
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ entryId, ...updates }: { entryId: string; [key: string]: any }) => {
      const { error } = await supabase.from('daily_entries').update(updates).eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-entries-detail', id] });
      toast.success('Saved');
    },
  });

  if (isLoading || !week) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const monday = new Date(week.week_start);
  const sunday = addDays(monday, 6);
  const primary = week.primary_evidence as unknown as PrimaryEvidence;
  const secondary = (week.secondary_evidence as unknown as PrimaryEvidence[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {format(monday, 'MMM d')} – {format(sunday, 'MMM d, yyyy')}
      </h1>

      <EvidenceCard label="Primary Evidence" evidence={primary} onChange={(e) => updateWeek.mutate({ primary_evidence: e as unknown as Json })} />
      {secondary.map((ev, i) => (
        <EvidenceCard key={i} label={`Secondary ${i + 1}`} evidence={ev} onChange={(e) => {
          const u = [...secondary]; u[i] = e;
          updateWeek.mutate({ secondary_evidence: u as unknown as Json });
        }} />
      ))}

      <div className="space-y-2 border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium">Weekly Focus</h2>
        <Input value={week.weekly_focus} onChange={(e) => updateWeek.mutate({ weekly_focus: e.target.value })} />
        <Textarea value={week.weekly_focus_constraints} onChange={(e) => updateWeek.mutate({ weekly_focus_constraints: e.target.value })} />
      </div>

      <div className="space-y-2 border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium">Commitments</h2>
        <div className="flex items-center gap-2"><Checkbox checked={week.open_source_completed} onCheckedChange={(v) => updateWeek.mutate({ open_source_completed: !!v })} /><Label className="text-sm">Open Source</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={week.skill_drill_1} onCheckedChange={(v) => updateWeek.mutate({ skill_drill_1: !!v })} /><Label className="text-sm">Drill 1</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={week.skill_drill_2} onCheckedChange={(v) => updateWeek.mutate({ skill_drill_2: !!v })} /><Label className="text-sm">Drill 2</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={week.skill_drill_3} onCheckedChange={(v) => updateWeek.mutate({ skill_drill_3: !!v })} /><Label className="text-sm">Drill 3</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={week.applications_completed} onCheckedChange={(v) => updateWeek.mutate({ applications_completed: !!v })} /><Label className="text-sm">Applications</Label></div>
      </div>

      {entries && (
        <Accordion type="single" collapsible>
          {entries.map((entry) => {
            const anchors = (entry.anchors as unknown as AnchorBlock[]) ?? [];
            return (
              <AccordionItem key={entry.id} value={`day-${entry.day_of_week}`}>
                <AccordionTrigger className="text-sm">{DAY_NAMES[entry.day_of_week]}</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  {anchors.map((anchor, i) => (
                    <AnchorBlockCard key={anchor.id} anchor={anchor} onChange={(updated) => {
                      const newAnchors = [...anchors]; newAnchors[i] = updated;
                      updateEntry.mutate({ entryId: entry.id, anchors: newAnchors as unknown as Json });
                    }} />
                  ))}
                  {dayHasCommitment(entry.day_of_week) && (
                    <div className="flex items-center gap-2 border border-border rounded-md p-3">
                      <Checkbox checked={entry.daily_commitment_completed} onCheckedChange={(v) => updateEntry.mutate({ entryId: entry.id, daily_commitment_completed: !!v })} />
                      <Label className="text-sm">Daily Commitment ({getCommitmentMinutes(entry.day_of_week)} min)</Label>
                    </div>
                  )}
                  {dayHasSkillDrill(entry.day_of_week) && (
                    <div className="flex items-center gap-2 border border-border rounded-md p-3">
                      <Checkbox checked={entry.skill_drill_completed} onCheckedChange={(v) => updateEntry.mutate({ entryId: entry.id, skill_drill_completed: !!v })} />
                      <Label className="text-sm">Skill Drill (30 min)</Label>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

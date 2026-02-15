import { useState } from 'react';
import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { useAuth } from '@/hooks/useAuth';
import { EvidenceCard } from '@/components/EvidenceCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PrimaryEvidence, DEFAULT_EVIDENCE, getDefaultAnchors } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Json } from '@/integrations/supabase/types';

export default function SundayPlanning() {
  const { week } = useCurrentWeek();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [primary, setPrimary] = useState<PrimaryEvidence>(DEFAULT_EVIDENCE);
  const [secondary, setSecondary] = useState<PrimaryEvidence[]>([]);
  const [focus, setFocus] = useState('');
  const [focusConstraints, setFocusConstraints] = useState('');
  const [osTitle, setOsTitle] = useState('');
  const [osRepo, setOsRepo] = useState('');

  const handleSave = async () => {
    if (!user || !week) return;
    setSaving(true);

    try {
      // Archive current week
      await supabase.from('weeks').update({ is_current: false }).eq('id', week.id);

      // Calculate next Monday
      const nextMonday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
      const nextMondayStr = format(nextMonday, 'yyyy-MM-dd');

      // Create new week
      const { data: newWeek, error } = await supabase
        .from('weeks')
        .insert({
          user_id: user.id,
          week_start: nextMondayStr,
          is_current: true,
          primary_evidence: primary as unknown as Json,
          secondary_evidence: secondary as unknown as Json,
          weekly_focus: focus,
          weekly_focus_constraints: focusConstraints,
          open_source_title: osTitle,
          open_source_repo: osRepo,
        })
        .select()
        .single();

      if (error) throw error;

      // Create daily entries
      const entries = Array.from({ length: 7 }, (_, i) => ({
        user_id: user.id,
        week_id: newWeek.id,
        day_of_week: i,
        day_date: format(addDays(nextMonday, i), 'yyyy-MM-dd'),
        anchors: getDefaultAnchors(i) as unknown as Json,
      }));
      await supabase.from('daily_entries').insert(entries);

      queryClient.invalidateQueries({ queryKey: ['current-week'] });
      toast.success('Next week planned!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isSunday = new Date().getDay() === 0;
  if (!isSunday) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sunday Planning</h1>
        <p className="text-sm text-muted-foreground">This page is only available on Sundays.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sunday Planning</h1>
      <p className="text-sm text-muted-foreground">Plan next week's focus and evidence.</p>

      <EvidenceCard label="Next Week Primary Evidence" evidence={primary} onChange={setPrimary} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Secondary Evidence</h2>
          {secondary.length < 2 && (
            <Button variant="outline" size="sm" onClick={() => setSecondary([...secondary, DEFAULT_EVIDENCE])}>Add</Button>
          )}
        </div>
        {secondary.map((ev, i) => (
          <EvidenceCard
            key={i}
            label={`Secondary ${i + 1}`}
            evidence={ev}
            onChange={(e) => { const u = [...secondary]; u[i] = e; setSecondary(u); }}
            onRemove={() => setSecondary(secondary.filter((_, idx) => idx !== i))}
          />
        ))}
      </div>

      <div className="space-y-3 border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium">Weekly Focus</h2>
        <Input placeholder="This week's anchor work is ONLY about..." value={focus} onChange={(e) => setFocus(e.target.value)} />
        <Textarea placeholder="Constraints / Notes" value={focusConstraints} onChange={(e) => setFocusConstraints(e.target.value)} />
      </div>

      <div className="space-y-3 border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium">Open Source Contribution</h2>
        <Input placeholder="Title" value={osTitle} onChange={(e) => setOsTitle(e.target.value)} />
        <Input placeholder="Repo link" value={osRepo} onChange={(e) => setOsRepo(e.target.value)} />
      </div>

      <p className="text-xs text-muted-foreground">Skill Drill (3 sessions) and Applications session will be reset for next week.</p>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Create Next Week & Archive Current'}
      </Button>
    </div>
  );
}

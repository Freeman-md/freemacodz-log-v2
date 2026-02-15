import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { EvidenceCard } from '@/components/EvidenceCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PrimaryEvidence, DEFAULT_EVIDENCE } from '@/lib/types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export default function WeeklyEvidence() {
  const { week, loading, updateWeek } = useCurrentWeek();

  if (loading || !week) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const primary = week.primary_evidence as unknown as PrimaryEvidence;
  const secondary = (week.secondary_evidence as unknown as PrimaryEvidence[]) ?? [];

  const save = (updates: Record<string, any>) => {
    updateWeek.mutate(updates, { onSuccess: () => toast.success('Saved') });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Weekly Evidence</h1>

      <EvidenceCard
        label="Primary Evidence"
        evidence={primary}
        onChange={(e) => save({ primary_evidence: e as unknown as Json })}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Secondary Evidence</h2>
          {secondary.length < 2 && (
            <Button variant="outline" size="sm" onClick={() => save({ secondary_evidence: [...secondary, DEFAULT_EVIDENCE] as unknown as Json })}>
              Add Secondary
            </Button>
          )}
        </div>
        {secondary.map((ev, i) => (
          <EvidenceCard
            key={i}
            label={`Secondary Evidence ${i + 1}`}
            evidence={ev}
            onChange={(e) => {
              const updated = [...secondary];
              updated[i] = e;
              save({ secondary_evidence: updated as unknown as Json });
            }}
            onRemove={() => {
              const updated = secondary.filter((_, idx) => idx !== i);
              save({ secondary_evidence: updated as unknown as Json });
            }}
          />
        ))}
      </div>

      <div className="space-y-3 border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium">Weekly Focus</h2>
        <Input
          placeholder="This week's anchor work is ONLY about..."
          value={week.weekly_focus}
          onChange={(e) => save({ weekly_focus: e.target.value })}
        />
        <Textarea
          placeholder="Constraints / Notes"
          value={week.weekly_focus_constraints}
          onChange={(e) => save({ weekly_focus_constraints: e.target.value })}
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}

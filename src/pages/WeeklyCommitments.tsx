import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function WeeklyCommitments() {
  const { week, loading, updateWeek } = useCurrentWeek();

  if (loading || !week) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const save = (updates: Partial<typeof week>) => {
    updateWeek.mutate(updates as any, { onSuccess: () => toast.success('Saved') });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Weekly Commitments</h1>

      {/* Open Source */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Open Source Contribution</h2>
        <Input placeholder="Title" value={week.open_source_title} onChange={(e) => save({ open_source_title: e.target.value })} />
        <Input placeholder="Repo link" value={week.open_source_repo} onChange={(e) => save({ open_source_repo: e.target.value })} />
        <div className="flex items-center gap-2">
          <Checkbox checked={week.open_source_completed} onCheckedChange={(v) => save({ open_source_completed: !!v })} />
          <Label className="text-sm">Completed</Label>
        </div>
      </div>

      {/* Skill Drill */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Skill Drill (3 sessions)</h2>
        {([['skill_drill_1', 'Session 1'], ['skill_drill_2', 'Session 2'], ['skill_drill_3', 'Session 3']] as const).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox checked={week[key]} onCheckedChange={(v) => save({ [key]: !!v })} />
            <Label className="text-sm">{label}</Label>
          </div>
        ))}
      </div>

      {/* Applications */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Applications Session</h2>
        <div className="flex items-center gap-2">
          <Checkbox checked={week.applications_completed} onCheckedChange={(v) => save({ applications_completed: !!v })} />
          <Label className="text-sm">Applications session completed this week</Label>
        </div>
        <Textarea
          placeholder="Optional notes"
          value={week.applications_notes}
          onChange={(e) => save({ applications_notes: e.target.value })}
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}

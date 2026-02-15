import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { AnchorBlockCard } from '@/components/AnchorBlockCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DAY_NAMES, AnchorBlock, dayHasCommitment, dayHasSkillDrill, getCommitmentMinutes } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';


export default function DailyExecution() {
  const { dailyEntries, loading, updateDailyEntry } = useCurrentWeek();

  if (loading || !dailyEntries) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Daily Execution</h1>

      <Accordion type="single" collapsible defaultValue={`day-${todayIndex}`}>
        {dailyEntries.map((entry) => {
          const anchors = (entry.anchors as unknown as AnchorBlock[]) ?? [];
          const hasCommitment = dayHasCommitment(entry.day_of_week);
          const hasSkillDrill = dayHasSkillDrill(entry.day_of_week);
          const minutes = getCommitmentMinutes(entry.day_of_week);
          const completedCount = anchors.filter((a) => a.completed).length;

          return (
            <AccordionItem key={entry.id} value={`day-${entry.day_of_week}`}>
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{DAY_NAMES[entry.day_of_week]}</span>
                  <span className="text-xs text-muted-foreground">{completedCount}/{anchors.length} anchors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                {anchors.map((anchor, i) => (
                  <AnchorBlockCard
                    key={anchor.id}
                    anchor={anchor}
                    onChange={(updated) => {
                      const newAnchors = [...anchors];
                      newAnchors[i] = updated;
                      updateDailyEntry.mutate(
                        { id: entry.id, anchors: newAnchors as any },
                        { onSuccess: () => toast.success('Saved') }
                      );
                    }}
                  />
                ))}

                {hasCommitment && (
                  <div className="flex items-center gap-2 border border-border rounded-md p-3">
                    <Checkbox
                      checked={entry.daily_commitment_completed}
                      onCheckedChange={(v) =>
                        updateDailyEntry.mutate(
                          { id: entry.id, daily_commitment_completed: !!v },
                          { onSuccess: () => toast.success('Saved') }
                        )
                      }
                    />
                    <Label className="text-sm">Daily Commitment ({minutes} min)</Label>
                  </div>
                )}

                {hasSkillDrill && (
                  <div className="flex items-center gap-2 border border-border rounded-md p-3">
                    <Checkbox
                      checked={entry.skill_drill_completed}
                      onCheckedChange={(v) =>
                        updateDailyEntry.mutate(
                          { id: entry.id, skill_drill_completed: !!v },
                          { onSuccess: () => toast.success('Saved') }
                        )
                      }
                    />
                    <Label className="text-sm">Skill Drill (30 min)</Label>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrimaryEvidence, dayHasCommitment, dayHasSkillDrill, AnchorBlock } from '@/lib/types';

export default function Dashboard() {
  const { week, dailyEntries, loading } = useCurrentWeek();

  if (loading || !week) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const evidence = week.primary_evidence as PrimaryEvidence;
  const evidenceChecks = [evidence.defined, evidence.built, evidence.documented, evidence.link_added].filter(Boolean).length;

  const allAnchors = (dailyEntries ?? []).flatMap((d) => (d.anchors as AnchorBlock[]) ?? []);
  const completedAnchors = allAnchors.filter((a) => a.completed).length;
  const totalAnchors = allAnchors.length;

  const skillDrills = [week.skill_drill_1, week.skill_drill_2, week.skill_drill_3].filter(Boolean).length;

  const monday = new Date(week.week_start);
  const sunday = addDays(monday, 6);
  const weekRange = `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{weekRange}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anchor Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{completedAnchors}/{totalAnchors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{evidenceChecks}/4</p>
            <p className="text-xs text-muted-foreground truncate">{evidence.title || 'Not set'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commitments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <p>Open Source: {week.open_source_completed ? '✓' : '–'}</p>
              <p>Skill Drill: {skillDrills}/3</p>
              <p>Applications: {week.applications_completed ? '✓' : '–'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/evidence" className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground">Weekly Evidence</Link>
        <Link to="/commitments" className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground">Weekly Commitments</Link>
        <Link to="/daily" className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground">Daily Execution</Link>
      </div>
    </div>
  );
}

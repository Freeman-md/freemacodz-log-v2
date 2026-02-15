export interface PrimaryEvidence {
  title: string;
  description: string;
  links: string;
  defined: boolean;
  built: boolean;
  documented: boolean;
  link_added: boolean;
}

export interface AnchorBlock {
  id: string;
  type: 'main' | 'mini' | 'optional-mini';
  completed: boolean;
  title: string;
  checklist: { id: string; text: string; done: boolean }[];
  notes: string;
}

export interface WeekRow {
  id: string;
  user_id: string;
  week_start: string;
  is_current: boolean;
  primary_evidence: PrimaryEvidence;
  secondary_evidence: PrimaryEvidence[];
  weekly_focus: string;
  weekly_focus_constraints: string;
  open_source_title: string;
  open_source_repo: string;
  open_source_completed: boolean;
  skill_drill_1: boolean;
  skill_drill_2: boolean;
  skill_drill_3: boolean;
  applications_completed: boolean;
  applications_notes: string;
  created_at: string;
  updated_at: string;
}

export interface DailyEntryRow {
  id: string;
  user_id: string;
  week_id: string;
  day_of_week: number;
  day_date: string;
  anchors: AnchorBlock[];
  daily_commitment_completed: boolean;
  skill_drill_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function getDefaultAnchors(dayIndex: number): AnchorBlock[] {
  const main: AnchorBlock = { id: 'main', type: 'main', completed: false, title: '', checklist: [], notes: '' };
  const mini1: AnchorBlock = { id: 'mini-1', type: 'mini', completed: false, title: '', checklist: [], notes: '' };
  const mini2: AnchorBlock = { id: 'mini-2', type: 'mini', completed: false, title: '', checklist: [], notes: '' };
  const optMini: AnchorBlock = { id: 'opt-mini', type: 'optional-mini', completed: false, title: '', checklist: [], notes: '' };

  switch (dayIndex) {
    case 0: // Monday
    case 2: // Wednesday
      return [main];
    case 1: // Tuesday
    case 3: // Thursday
      return [main, { ...mini1 }, { ...mini2 }];
    case 4: // Friday
      return [main, { ...mini1 }, { ...optMini }];
    case 5: // Saturday
      return [main, { ...mini1 }];
    case 6: // Sunday
      return [main];
    default:
      return [main];
  }
}

export function dayHasCommitment(dayIndex: number): boolean {
  return dayIndex >= 0 && dayIndex <= 4; // Mon-Fri
}

export function getCommitmentMinutes(dayIndex: number): number {
  if (dayIndex === 0 || dayIndex === 2) return 25;
  if (dayIndex >= 1 && dayIndex <= 4) return 45;
  return 0;
}

export function dayHasSkillDrill(dayIndex: number): boolean {
  return dayIndex === 1 || dayIndex === 3 || dayIndex === 4; // Tue, Thu, Fri
}

export const DEFAULT_EVIDENCE: PrimaryEvidence = {
  title: '', description: '', links: '', defined: false, built: false, documented: false, link_added: false,
};

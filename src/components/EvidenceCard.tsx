import { PrimaryEvidence } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Props {
  label: string;
  evidence: PrimaryEvidence;
  onChange: (e: PrimaryEvidence) => void;
  onRemove?: () => void;
}

export function EvidenceCard({ label, evidence, onChange, onRemove }: Props) {
  const update = (key: keyof PrimaryEvidence, value: any) => onChange({ ...evidence, [key]: value });

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{label}</h3>
        {onRemove && (
          <button onClick={onRemove} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
        )}
      </div>
      <Input placeholder="Title" value={evidence.title} onChange={(e) => update('title', e.target.value)} />
      <Textarea placeholder="Description" value={evidence.description} onChange={(e) => update('description', e.target.value)} className="min-h-[60px]" />
      <Input placeholder="Links" value={evidence.links} onChange={(e) => update('links', e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {(['defined', 'built', 'documented', 'link_added'] as const).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox checked={evidence[key]} onCheckedChange={(v) => update(key, !!v)} />
            <Label className="text-xs capitalize">{key.replace('_', ' ')}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}

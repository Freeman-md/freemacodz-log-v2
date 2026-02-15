import { AnchorBlock } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Props {
  anchor: AnchorBlock;
  onChange: (a: AnchorBlock) => void;
}

export function AnchorBlockCard({ anchor, onChange }: Props) {
  const label = anchor.type === 'main' ? 'Main Anchor' : anchor.type === 'mini' ? 'Mini Anchor' : 'Optional Mini Anchor';

  const addChecklistItem = () => {
    onChange({
      ...anchor,
      checklist: [...anchor.checklist, { id: crypto.randomUUID(), text: '', done: false }],
    });
  };

  const updateChecklistItem = (id: string, updates: Partial<{ text: string; done: boolean }>) => {
    onChange({
      ...anchor,
      checklist: anchor.checklist.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeChecklistItem = (id: string) => {
    onChange({ ...anchor, checklist: anchor.checklist.filter((c) => c.id !== id) });
  };

  return (
    <div className="border border-border rounded-md p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox checked={anchor.completed} onCheckedChange={(v) => onChange({ ...anchor, completed: !!v })} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <Input placeholder="Title" value={anchor.title} onChange={(e) => onChange({ ...anchor, title: e.target.value })} />
      
      {/* Checklist */}
      <div className="space-y-1">
        {anchor.checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox checked={item.done} onCheckedChange={(v) => updateChecklistItem(item.id, { done: !!v })} />
            <Input
              className="h-8 text-sm"
              value={item.text}
              onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
              placeholder="Checklist item"
            />
            <button onClick={() => removeChecklistItem(item.id)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addChecklistItem} className="text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add item
        </Button>
      </div>

      <Textarea placeholder="Notes" value={anchor.notes} onChange={(e) => onChange({ ...anchor, notes: e.target.value })} className="min-h-[40px] text-sm" />
    </div>
  );
}

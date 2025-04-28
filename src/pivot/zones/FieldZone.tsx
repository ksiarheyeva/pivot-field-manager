import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { AArrowDown, AArrowUp, Plus, Save, Search } from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields } = usePivotConfig();
  const { setNodeRef, isOver } = useDroppable({ id: type });
  const fields = getFieldsForZone(type);

  const originalRef = useRef<FieldConfig[] | null>(null);

  const [sortState, setSortState] = useState('default');
  const [search, setSearch] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);

  useDndMonitor({
    onDragStart(event) {
      setActiveId(event.active.id as string);
    },
    onDragEnd() {
      setActiveId(null);
    },
    onDragCancel() {
      setActiveId(null);
    },
  });

  function toggleSort() {
    const next = sortState === 'default' ? 'asc' : sortState === 'asc' ? 'desc' : 'default';

    setSortState(next);

    let sorted;
    const zoneFields = fields.filter((f) => f.zone === type);
    if (next === 'asc') {
      if (!originalRef.current) {
        originalRef.current = zoneFields;
      }
      sorted = [...fields].sort((a, b) => a.id.localeCompare(b.id));
    } else if (next === 'desc') {
      if (!originalRef.current) {
        originalRef.current = zoneFields;
      }
      sorted = [...fields].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      sorted = originalRef.current ?? zoneFields;
      originalRef.current = null;
    }

    updateZoneFields(type, sorted);
  }

  const filteredFields = fields.filter((field) =>
    field.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col h-full border overflow-hidden rounded transition-colors ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold capitalize select-none">{type}</h3>

          {type === 'available' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  New field
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add new field</DialogTitle>
                  <DialogDescription>
                    Create a new field. Click save when you are finished.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <Input placeholder="New field" />
                  </div>
                  <Textarea placeholder="Expression" />
                </div>
                <DialogFooter>
                  <Button variant="outline">
                    <Save />
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {fields.length !== 0 && fields.length !== 1 ? (
            <div className="flex gap-2 ml-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Field search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSort}
                className={sortState === 'default' ? 'opacity-40' : 'text-accent-500'}
                disabled={fields.length === 0 || fields.length === 1}
              >
                {sortState === 'default' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'asc' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'desc' && <AArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 ">
        {fields.length === 0 && (
          <div className="text-sm text-muted-foreground italic select-none">No fields</div>
        )}

        {search !== '' && filteredFields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic select-none">Not found</div>
        ) : (
          <>
            {filteredFields.map((field) =>
              field.id === activeId ? null : <FieldItem key={field.id} field={field} zone={type} />,
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FieldZone;

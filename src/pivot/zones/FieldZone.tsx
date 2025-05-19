import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { AArrowDown, AArrowUp, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';
import NewFieldDialog from '../NewFieldDialog';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields } = usePivotConfig();
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const fields = getFieldsForZone(type);
  console.log(fields, 'fields');

  const originalRef = useRef<FieldConfig[]>([]);

  const [sortState, setSortState] = useState<'default' | 'asc' | 'desc'>('default');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Update originalRef: add only new fields
  useEffect(() => {
    const currentIds = new Set(fields.map((f) => f.id));
    const originalIds = new Set(originalRef.current.map((f) => f.id));

    const addedFields = fields.filter((f) => !originalIds.has(f.id));
    const removedFields = originalRef.current.filter((f) => !currentIds.has(f.id));

    if (addedFields.length > 0 || removedFields.length > 0) {
      // Add to the end of the originalRef
      originalRef.current = [
        ...originalRef.current.filter((f) => currentIds.has(f.id)), // clean up deleted
        ...addedFields, // add new fileds to the end
      ];
    }
  }, [fields]);

  function sortFields(
    fields: FieldConfig[],
    sortState: 'default' | 'asc' | 'desc',
    original?: FieldConfig[],
  ): FieldConfig[] {
    if (sortState === 'asc') {
      return [...fields].sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortState === 'desc') {
      return [...fields].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      const orderMap = new Map(original?.map((f, idx) => [f.id, idx]));

      return [...fields].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    }
  }

  // Auto-apply sorting when moving/adding
  useEffect(() => {
    if (sortState !== 'default') {
      const sorted = sortFields(fields, sortState, originalRef.current);
      updateZoneFields(type, sorted);
    }
  }, [fields.length]);

  function toggleSort() {
    const next = sortState === 'default' ? 'asc' : sortState === 'asc' ? 'desc' : 'default';

    setSortState(next);
    const sorted = sortFields(fields, next, originalRef.current);
    updateZoneFields(type, sorted);
  }

  const filteredFields = fields.filter((field) =>
    field.id.toLowerCase().includes(search.toLowerCase()),
  );

  // useEffect(() => {
  //   if (open) {
  //     reset({ id: 'New Field 1', expression: '' }); // setting default values
  //     form.trigger('id'); // validation of Id field on opening (.refine)
  //   }
  // }, [open, reset, form]);

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

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col h-full border overflow-hidden rounded transition-colors ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold capitalize select-none px-1">{type}</h3>

          {type === 'available' && <NewFieldDialog type={type} />}

          {fields.length > 1 ? (
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
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic select-none">
            No fields
          </div>
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

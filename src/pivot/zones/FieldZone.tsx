import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDroppable } from '@dnd-kit/core';
import { AArrowDown, AArrowUp, Search } from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields } = usePivotConfig();
  const fields = getFieldsForZone(type);
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const originalRef = useRef<FieldConfig[] | null>(null);

  const [sortState, setSortState] = useState('default');
  const [search, setSearch] = useState('');

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
    <div className="grid grid-flow-col">
      <div
        ref={setNodeRef}
        className={`border rounded p-2 min-h-[50px] transition-colors ${
          isOver ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        <div className="flex justify-between mb-3">
          <h3 className="text-sm font-semibold capitalize mb-2">{type}</h3>

          {fields.length !== 0 && fields.length !== 1 ? (
            <div className="flex gap-2 ml-1">
              <div className="relative ">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Field search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
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

        <div className="flex flex-wrap gap-2">
          {fields.length === 0 && (
            <div className="text-sm text-muted-foreground italic">No fields</div>
          )}

          {search !== '' && filteredFields.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">Not found</div>
          ) : (
            filteredFields.map((field) => <FieldItem key={field.id} field={field} zone={type} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default FieldZone;

import { Button } from '@/components/ui/button';
import { useDroppable } from '@dnd-kit/core';
import { AArrowDown, AArrowUp } from 'lucide-react';
import { useRef, useState } from 'react';

import { usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields } = usePivotConfig();
  const fields = getFieldsForZone(type);
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const [sortState, setSortState] = useState('default');
  const initialRef = useRef(fields);

  function toggleSort() {
    const next = sortState === 'default' ? 'asc' : sortState === 'asc' ? 'desc' : 'default';

    setSortState(next);

    let sorted;

    if (next === 'asc') {
      sorted = [...fields]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((f) => ({ ...f, zone: type }));
    } else if (next === 'desc') {
      sorted = [...fields]
        .sort((a, b) => b.id.localeCompare(a.id))
        .map((f) => ({ ...f, zone: type }));
    } else {
      sorted = initialRef.current.filter((f) => f.zone === type);
    }

    updateZoneFields(type, sorted);
  }

  return (
    <div className="grid grid-flow-col">
      <div
        ref={setNodeRef}
        className={`overflow-auto border p-2 rounded max-h-60 min-h-[80px] transition-colors ${
          isOver ? 'bg-accent' : 'bg-background'
        }`}
      >
        <div className="flex justify-between mb-5">
          <h3 className="text-sm font-semibold capitalize mb-2">{type}</h3>
          <div className="flex gap-2 ml-1">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSort}
              className={sortState === 'default' ? 'opacity-40' : 'text-accent-500'}
            >
              {sortState === 'default' && <AArrowUp className="w-4 h-4" />}
              {sortState === 'asc' && <AArrowUp className="w-4 h-4" />}
              {sortState === 'desc' && <AArrowDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <FieldItem key={field.id} field={field} zone={type} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FieldZone;

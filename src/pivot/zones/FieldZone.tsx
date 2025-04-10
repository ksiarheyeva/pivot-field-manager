import { useDroppable } from '@dnd-kit/core';

import { usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone } = usePivotConfig();
  const fields = getFieldsForZone(type);
  const { setNodeRef, isOver } = useDroppable({ id: type });

  return (
    <div
      ref={setNodeRef}
      className={`border p-2 rounded min-h-[60px] transition-colors ${
        isOver ? 'bg-accent' : 'bg-background'
      }`}
    >
      <h3 className="text-sm font-semibold capitalize mb-2">{type}</h3>
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <FieldItem key={field.id} field={field} zone={type} />
        ))}
      </div>
    </div>
  );
}

export default FieldZone;

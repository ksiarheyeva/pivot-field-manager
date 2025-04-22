import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';

function FieldItem({ field, zone }: { field: FieldConfig; zone: ZoneType }) {
  const { moveFieldToZone, updateFieldConfig, aggregations } = usePivotConfig();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  const handleMove = (targetZone: ZoneType) => {
    moveFieldToZone(field.id, targetZone);
  };

  const handleAggregationChange = (value: string) => {
    updateFieldConfig(field.id, {
      aggregation: value as FieldConfig['aggregation'],
    });
  };

  const handleSortChange = (value: string) => {
    updateFieldConfig(field.id, { sort: value as FieldConfig['sort'] });
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="flex items-center gap-2 px-2 py-1 border rounded bg-muted text-sm cursor-grab"
    >
      {/* Drag handle */}
      <span {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </span>

      <span>{field.id}</span>

      {zone === 'values' && (
        <Select
          onValueChange={handleAggregationChange}
          defaultValue={
            field.aggregation && aggregations.includes(field.aggregation) ? field.aggregation : ''
          }
        >
          <SelectTrigger className="h-6">
            <SelectValue placeholder="agg" />
          </SelectTrigger>
          <SelectContent>
            {aggregations.map((agg) => (
              <SelectItem value={`${agg}`} key={agg}>
                {agg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(zone === 'rows' || zone === 'columns') && (
        <Select onValueChange={handleSortChange} defaultValue={field.sort}>
          <SelectTrigger className="h-6">
            <SelectValue placeholder="sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">asc</SelectItem>
            <SelectItem value="desc">desc</SelectItem>
          </SelectContent>
        </Select>
      )}

      {zone !== 'available' && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-xs"
          onClick={(e) => {
            e.stopPropagation(); // ⛔️ предотврати drag
            handleMove('available');
          }}
        >
          ✕
        </Button>
      )}
    </div>
  );
}

export default FieldItem;

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

function FieldItem({
  field,
  zone,
  isOverlay = false,
}: {
  field: FieldConfig;
  zone?: ZoneType;
  isOverlay?: boolean;
}) {
  const { moveFieldToZone, updateFieldConfig, aggregations } = usePivotConfig();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
    data: {
      field,
      fromZone: zone, // type — 'rows', 'columns' etc.
    },
    // disabled: isOverlay,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  if (isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          pointerEvents: 'none', // Disable pointer events for overlay
          zIndex: 9999,
        }}
        className="flex items-center justify-between gap-2 px-2 py-1 border rounded bg-muted text-sm shadow-lg overflow-hidden select-none"
      >
        <div {...listeners} className="flex flex-1 items-center gap-2">
          <span className="cursor-grab">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </span>

          <span>{field.id}</span>
        </div>
      </div>
    );
  }

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
      className="flex items-center justify-between gap-2 px-2 py-1 border rounded bg-muted text-sm cursor-grab select-none"
    >
      <div {...listeners} className="flex flex-1 items-center gap-2">
        <span className="cursor-grab">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </span>

        <span>{field.id}</span>
      </div>

      <div className="flex gap-1">
        {zone === 'values' && (
          <Select
            onValueChange={handleAggregationChange}
            defaultValue={
              field.aggregation && aggregations.includes(field.aggregation) ? field.aggregation : ''
            }
          >
            <SelectTrigger size="sm">
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
            <SelectTrigger size="sm">
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
            className="ml-auto text-xs cursor-pointer hover:bg-gray-200 text-gray-600 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleMove('available');
            }}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

export default FieldItem;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useEffect, useState } from 'react';

import ConfigProvider, { FieldConfig, usePivotConfig, ZoneType } from './config/ConfigContext';
import ConfigViewerPopover from './ConfigViewerPopover';
import FieldItem from './items/FieldItem';
import ValidatePivotConfig from './ValidatePivotConfig';
import FieldZone from './zones/FieldZone';

const ZONES: ZoneType[] = ['available', 'rows', 'columns', 'filters', 'values'];

const PivotManagerInner = () => {
  const { fields, moveFieldToZone } = usePivotConfig();
  const [activeField, setActiveField] = useState<FieldConfig | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    const allFields = fields;
    setActiveField(allFields.find((f) => f.id === draggedId) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('active:', active, 'over:', over);

    if (over && ZONES.includes(over.id as ZoneType)) {
      moveFieldToZone(active.id as string, over.id as ZoneType);
    }
    setActiveField(null);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={false}
      sensors={sensors}
    >
      <div className="flex flex-col h-full gap-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          <div className="h-full overflow-hidden">
            <FieldZone type="available" />
          </div>
          <div className="grid grid-rows-4 gap-4 h-full overflow-hidden">
            {(['rows', 'columns', 'filters', 'values'] as const).map((zone) => (
              <FieldZone key={zone} type={zone} />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null} className="cursor-grab" modifiers={[restrictToWindowEdges]}>
        {activeField ? <FieldItem field={activeField} isOverlay={true} /> : null}
      </DragOverlay>
      <ConfigViewerPopover />
    </DndContext>
  );
};

type PivotFieldManagerProps = {
  fields: string[];
  initialConfig: FieldConfig[];
  aggregations: string[];
  onChange?: (config: FieldConfig[]) => void;
  onFieldUpdate?: (updated: FieldConfig) => void;
};

function PivotFieldManager({
  fields,
  initialConfig,
  onChange,
  onFieldUpdate,
  aggregations,
}: PivotFieldManagerProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const errors = ValidatePivotConfig({
      fields,
      config: initialConfig,
      allowedAggregations: aggregations,
      allowedZones: ZONES,
    });

    if (errors.length > 0) {
      console.error('❌ Invalid Pivot Config:', errors);
      setValidationErrors(errors);
    }
  }, [fields, initialConfig, aggregations]);

  return (
    <ConfigProvider
      availableFields={fields}
      initialConfig={initialConfig}
      onChange={onChange}
      onFieldUpdate={onFieldUpdate}
      aggregations={aggregations}
    >
      {validationErrors.length > 0 ? (
        <Card className="border-red-400 bg-red-50 text-red-800">
          <CardHeader className="flex flex-row items-center space-x-2">
            <CardTitle>The configuration is invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <PivotManagerInner />
      )}
    </ConfigProvider>
  );
}

export default PivotFieldManager;

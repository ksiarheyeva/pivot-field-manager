import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEffect, useState } from 'react';

import ConfigProvider, { FieldConfig, usePivotConfig, ZoneType } from './config/ConfigContext';
import ConfigViewerPopover from './ConfigViewerPopover';
import ValidatePivotConfig from './ValidatePivotConfig';
import FieldZone from './zones/FieldZone';

const ZONES: ZoneType[] = ['available', 'rows', 'columns', 'filters', 'values'];

const PivotManagerInner = () => {
  const { moveFieldToZone } = usePivotConfig();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && ZONES.includes(over.id as ZoneType)) {
      moveFieldToZone(active.id as string, over.id as ZoneType);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> */}
      <div className="grid grid-cols-1 gap-4">
        {ZONES.map((zone) => (
          <FieldZone key={zone} type={zone} />
        ))}
      </div>

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
      // Можно бросить ошибку или отобразить предупреждение в UI
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

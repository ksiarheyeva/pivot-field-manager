import { DndContext, DragEndEvent } from '@dnd-kit/core';

import ConfigProvider, { FieldConfig, usePivotConfig, ZoneType } from './config/ConfigContext';
import FieldZone from './zones/FieldZone';

const ZONES: ZoneType[] = ['available', 'rows', 'columns', 'filters', 'values'];

const ConfigViewer = () => {
  const { fields } = usePivotConfig();
  return (
    <pre className="mt-4 p-4 bg-muted text-xs rounded overflow-auto max-h-64">
      {JSON.stringify(fields, null, 2)}
    </pre>
  );
};

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ZONES.map((zone) => (
          <FieldZone key={zone} type={zone} />
        ))}
      </div>
      <ConfigViewer />
    </DndContext>
  );
};

function PivotFieldManager({
  fields,
  initialConfig,
  onChange,
  onFieldUpdate,
}: {
  fields: string[];
  initialConfig?: FieldConfig[];
  onChange?: (config: FieldConfig[]) => void;
  onFieldUpdate?: (field: FieldConfig) => void;
}) {
  return (
    <ConfigProvider
      availableFields={fields}
      initialConfig={initialConfig}
      onChange={onChange}
      onFieldUpdate={onFieldUpdate}
    >
      <PivotManagerInner />
    </ConfigProvider>
  );
}

export default PivotFieldManager;

import { createContext, useContext, useEffect, useState } from 'react';

export type ZoneType = 'available' | 'rows' | 'columns' | 'filters' | 'values';

export type FieldConfig = {
  id: string; // Unique ID (field name)
  zone: ZoneType;
  sort?: 'asc' | 'desc';
  aggregation?: string;
};

export type ConfigContextType = {
  fields: FieldConfig[];
  moveFieldToZone: (fieldId: string, zone: ZoneType) => void;
  getFieldsForZone: (zone: ZoneType) => FieldConfig[];
  updateFieldConfig: (fieldId: string, updates: Partial<FieldConfig>) => void;
  aggregations: string[];
  updateZoneFields: (zone: ZoneType, updatedFields: FieldConfig[]) => void;
};

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function ConfigProvider({
  children,
  availableFields,
  initialConfig,
  onChange,
  onFieldUpdate,
  aggregations,
}: {
  children: React.ReactNode;
  availableFields: string[];
  initialConfig?: FieldConfig[];
  onChange?: (fields: FieldConfig[]) => void;
  onFieldUpdate?: (field: FieldConfig) => void;
  aggregations: string[];
}) {
  const [fields, setFields] = useState<FieldConfig[]>(() => {
    const configById = new Map(initialConfig?.map((f) => [f.id, f]) || []);

    // Ensures that all passed fields are in the configuration
    return availableFields.map((id) => configById.get(id) || { id, zone: 'available' });
  });

  useEffect(() => {
    if (onChange) onChange(fields);
  }, [fields, onChange]);

  const moveFieldToZone = (fieldId: string, zone: ZoneType) => {
    setFields((prev) => {
      const updatedFields = prev.filter((f) => f.id !== fieldId);
      const moved = prev.find((f) => f.id === fieldId);
      if (!moved) return prev;

      const updated = { ...moved, zone };
      if (onFieldUpdate) onFieldUpdate(updated);

      return [...updatedFields, updated];
    });
  };

  const updateFieldConfig = (fieldId: string, updates: Partial<FieldConfig>) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === fieldId) {
          const updated = { ...field, ...updates };
          if (onFieldUpdate) onFieldUpdate(updated);
          return updated;
        }
        return field;
      }),
    );
  };

  const getFieldsForZone = (zone: ZoneType) => {
    return fields.filter((f) => f.zone === zone);
  };

  type FieldConfig = {
    id: string;
    zone: ZoneType;
  };

  const updateZoneFields = (zone: ZoneType, updatedFields: FieldConfig[]) => {
    setFields((prev) => {
      const others = prev.filter((f) => f.zone !== zone);
      return [...others, ...updatedFields];
    });
  };

  return (
    <ConfigContext.Provider
      value={{
        fields,
        updateFieldConfig,
        moveFieldToZone,
        getFieldsForZone,
        aggregations,
        updateZoneFields,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export default ConfigProvider;

export const usePivotConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('usePivotConfig must be used within ConfigProvider');
  return context;
};

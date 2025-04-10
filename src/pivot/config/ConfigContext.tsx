import { createContext, useContext, useEffect, useState } from 'react';

export type ZoneType = 'available' | 'rows' | 'columns' | 'filters' | 'values';

export type FieldConfig = {
  id: string; // Уникальный ID (field name)
  zone: ZoneType;
  sort?: 'asc' | 'desc';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
};

export type ConfigContextType = {
  fields: FieldConfig[];
  moveFieldToZone: (fieldId: string, zone: ZoneType) => void;
  getFieldsForZone: (zone: ZoneType) => FieldConfig[];
  updateFieldConfig: (fieldId: string, updates: Partial<FieldConfig>) => void;
};

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function ConfigProvider({
  children,
  availableFields,
  initialConfig,
  onChange,
  onFieldUpdate,
}: {
  children: React.ReactNode;
  availableFields: string[];
  initialConfig?: FieldConfig[];
  onChange?: (fields: FieldConfig[]) => void;
  onFieldUpdate?: (field: FieldConfig) => void;
}) {
  const [fields, setFields] = useState<FieldConfig[]>(() => {
    const configById = new Map(initialConfig?.map((f) => [f.id, f]) || []);

    // Гарантируем, что все переданные поля окажутся в конфигурации
    return availableFields.map((id) => configById.get(id) || { id, zone: 'available' });
  });

  useEffect(() => {
    if (onChange) onChange(fields);
  }, [fields, onChange]);

  const moveFieldToZone = (fieldId: string, zone: ZoneType) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === fieldId) {
          const updated = { ...field, zone };
          if (onFieldUpdate) onFieldUpdate(updated);
          return updated;
        }
        return field;
      }),
    );
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

  console.log(fields, 'fieldsConfig');

  return (
    <ConfigContext.Provider
      value={{ fields, updateFieldConfig, moveFieldToZone, getFieldsForZone }}
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

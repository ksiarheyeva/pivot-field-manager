import { FieldConfig } from './pivot/config/ConfigContext';
import PivotFieldManager from './pivot/PivotFieldManager';

function App() {
  const handleConfigChange = (config: FieldConfig[]) => {
    console.log('🔄 Конфигурация обновлена:', config);
  };

  const handleFieldUpdate = (updatedField: FieldConfig) => {
    console.log('🛠️ Поле обновлено:', updatedField);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pivot Manager Demo</h1>
      <PivotFieldManager
        fields={['country', 'city', 'sales', 'date', 'category']}
        initialConfig={[
          { id: 'country', zone: 'rows' },
          { id: 'sales', zone: 'values', aggregation: 'sum' },
        ]}
        onChange={handleConfigChange}
        onFieldUpdate={handleFieldUpdate}
      />
    </div>
  );
}

export default App;

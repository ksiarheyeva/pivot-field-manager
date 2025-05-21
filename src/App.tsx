import { useTranslation } from 'react-i18next';

import { Toaster } from './components/ui/sonner';
import { FieldConfig } from './pivot/config/ConfigContext';
import LanguageSwitcher from './pivot/LanguageSwitcher';
import PivotFieldManager from './pivot/PivotFieldManager';

function App() {
  const { t, i18n } = useTranslation();

  const handleConfigChange = (config: FieldConfig[]) => {
    console.log('🔄 Configuration updated:', config);
  };

  const handleFieldUpdate = (updatedField: FieldConfig) => {
    console.log('🛠️ Field updated:', updatedField);
  };

  const aggregations = ['sum', 'avg', 'count', 'min', 'max'];

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className="flex flex-col max-w-5xl m-auto h-screen p-2">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold m-4">{t('title')}</h1>
          <LanguageSwitcher handleLanguageChange={handleLanguageChange} />
        </div>
        <PivotFieldManager
          fields={[
            'sales',
            'date',
            'order_id',
            'customer_id',
            'customer_name',
            'email',
            'phone',
            'country',
            'city',
            'region',
            'postal_code',
            'address',
            'product_id',
            'product_name',
            'category',
            'sub_category',
            'brand',
            'sku',
            'quantity',
            'unit_price',
            'discount',
            'tax',
            'total_price',
            'currency',
            'payment_method',
            'transaction_id',
            'transaction_date',
            'shipping_method',
            'shipping_cost',
            'delivery_date',
            'delivery_status',
            'warehouse',
            'stock_level',
            'supplier',
            'supplier_rating',
            'return_status',
            'return_reason',
            'feedback_score',
            'review_count',
            'campaign_id',
            'campaign_name',
            'channel',
            'device_type',
            'browser',
            'os',
            'visit_duration',
            'page_views',
            'bounce_rate',
            'referrer',
            'utm_source',
            'utm_medium',
            'utm_campaign',
          ]}
          initialConfig={[
            { id: 'country', zone: 'rows' },
            { id: 'sales', zone: 'values', aggregation: 'sum' },
          ]}
          aggregations={aggregations}
          onChange={handleConfigChange}
          onFieldUpdate={handleFieldUpdate}
        />
      </div>

      <Toaster />
    </>
  );
}

export default App;

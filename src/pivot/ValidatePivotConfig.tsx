import { FieldConfig, ZoneType } from './config/ConfigContext';

type ValidatePivotConfigOptions = {
  fields: string[];
  config: FieldConfig[];
  allowedZones?: ZoneType[];
  allowedAggregations?: string[];
};

function ValidatePivotConfig({
  fields,
  config,
  allowedZones,
  allowedAggregations,
}: ValidatePivotConfigOptions) {
  const errors: string[] = [];

  const fieldSet = new Set(fields);
  const seenIds = new Set<string>();

  const duplicates = fields.filter((id, i, arr) => arr.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push(`Field duplicates: '${[...new Set(duplicates)].join(', ')}'`);
  }

  for (const item of config) {
    // 1. Проверка: поле должно существовать (Все id в initialConfig присутствуют в fields.)
    if (!fieldSet.has(item.id)) {
      errors.push(`Field "${item.id}" in config does not exist in fields list.`);
    }
    // 2. Проверка: уникальность ID (Нет дубликатов id в initialConfig)
    if (seenIds.has(item.id)) {
      errors.push(`Duplicate field "${item.id}" in config.`);
    } else {
      seenIds.add(item.id);
    }

    // 3. Проверка: допустимая зона (Значения zone, aggregation и sort соответствуют допустимым значениям) "available" | "rows" | "columns" | "filters" | "values"
    if (!allowedZones?.includes(item.zone)) {
      errors.push(`Field "${item.id}" has invalid zone "${item.zone}".`);
    }

    // 4. Проверка: если zone === "values", то должна быть агрегация
    if (item.zone === 'values') {
      if (!item.aggregation || !allowedAggregations?.includes(item.aggregation)) {
        errors.push(
          `Field "${item.id}" in "values" must have valid aggregation (${allowedAggregations?.join(', ')}).`,
        );
      }
    }

    // 5. Проверка: если есть сортировка, она должна быть допустимой
    if (item.sort && !['asc', 'desc'].includes(item.sort)) {
      errors.push(`Field "${item.id}" has invalid sort value "${item.sort}".`);
    }
  }

  return errors;
}

export default ValidatePivotConfig;

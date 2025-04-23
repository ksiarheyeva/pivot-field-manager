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
    // 1. Check: the field must exist (All id's in initialConfig are present in fields.).
    if (!fieldSet.has(item.id)) {
      errors.push(`Field "${item.id}" in config does not exist in fields list.`);
    }
    // 2. Check: ID uniqueness (No duplicate ids in initialConfig)
    if (seenIds.has(item.id)) {
      errors.push(`Duplicate field "${item.id}" in config.`);
    } else {
      seenIds.add(item.id);
    }

    // 3. Check: valid zone (The values of zone, aggregation and sort correspond to valid values) "available" | "rows" | "columns" | "filters" | "values".
    if (!allowedZones?.includes(item.zone)) {
      errors.push(`Field "${item.id}" has invalid zone "${item.zone}".`);
    }

    // 4. Check: if zone === "values", there must be an aggregation
    if (item.zone === 'values') {
      if (!item.aggregation || !allowedAggregations?.includes(item.aggregation)) {
        errors.push(
          `Field "${item.id}" in "values" must have valid aggregation (${allowedAggregations?.join(', ')}).`,
        );
      }
    }

    // 5. Check: if there is sorting, it must be valid
    if (item.sort && !['asc', 'desc'].includes(item.sort)) {
      errors.push(`Field "${item.id}" has invalid sort value "${item.sort}".`);
    }
  }

  return errors;
}

export default ValidatePivotConfig;

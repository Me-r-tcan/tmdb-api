interface GenerateWhereInputOptions<T> {
  exactFields?: (keyof T)[];
  excludeFields?: (keyof T)[];
  nonExactFields?: (keyof T)[];
}

export function generateMongoFilters<T>(
  queryDto: Partial<T>,
  options: GenerateWhereInputOptions<T> = {},
): Record<string, any> {
  const { exactFields = [], excludeFields = [], nonExactFields = [] } = options;

  const excludeSet = new Set<keyof T | 'page' | 'limit'>([
    ...excludeFields,
    'page',
    'limit',
  ]);

  const conditions: Record<string, any>[] = [];

  conditions.push(...buildExactMatches(queryDto, exactFields, excludeSet));
  conditions.push(
    ...buildNonExactMatches(queryDto, nonExactFields, excludeSet),
  );
  conditions.push(...buildRangeQueries(queryDto, excludeSet));

  return conditions.length > 0 ? { $and: conditions } : {};
}

function buildRangeQueries<T>(
  queryDto: Partial<T>,
  excludeSet: Set<keyof T | 'page' | 'limit'>,
): Record<string, any>[] {
  const rangeConditions: Record<string, any> = {};

  Object.entries(queryDto).forEach(([key, value]) => {
    if (!value || excludeSet.has(key as keyof T)) return;

    if (key.endsWith('.gte') || key.endsWith('.lte')) {
      const baseField = key.replace(/(\.gte|\.lte)$/i, '');
      rangeConditions[baseField] = rangeConditions[baseField] || {};
      if (key.endsWith('.gte')) rangeConditions[baseField].$gte = value;
      if (key.endsWith('.lte')) rangeConditions[baseField].$lte = value;
    }
  });

  return Object.entries(rangeConditions).map(([key, condition]) => ({
    [key]: condition,
  }));
}

function buildExactMatches<T>(
  queryDto: Partial<T>,
  exactFields: (keyof T)[],
  excludeSet: Set<keyof T | 'page' | 'limit'>,
): Record<string, any>[] {
  return Object.entries(queryDto)
    .filter(
      ([key, value]) =>
        value !== undefined &&
        exactFields.includes(key as keyof T) &&
        !excludeSet.has(key as keyof T),
    )
    .map(([key, value]) => ({ [key]: value }));
}

function buildNonExactMatches<T>(
  queryDto: Partial<T>,
  nonExactFields: (keyof T)[],
  excludeSet: Set<keyof T | 'page' | 'limit'>,
): Record<string, any>[] {
  return Object.entries(queryDto)
    .filter(
      ([key, value]) =>
        typeof value === 'string' &&
        nonExactFields.includes(key as keyof T) &&
        !excludeSet.has(key as keyof T),
    )
    .map(([key, value]) => ({
      [key]: { $regex: new RegExp(value as string, 'i') },
    }));
}

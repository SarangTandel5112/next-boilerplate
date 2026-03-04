type StableKeyValue = null | boolean | number | string | StableKeyValue[] | { [key: string]: StableKeyValue };

const normalizeForStableKey = (value: unknown, seen: WeakSet<object>): StableKeyValue => {
  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeForStableKey(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      throw new Error('Circular structure is not supported in query keys');
    }

    seen.add(value);

    const recordValue = value as Record<string, unknown>;
    const normalizedEntries = Object.keys(recordValue)
      .sort((left, right) => left.localeCompare(right))
      .flatMap((key) => {
        const currentValue = recordValue[key];

        if (currentValue === undefined) {
          return [];
        }

        return [[key, normalizeForStableKey(currentValue, seen)] as const];
      });

    seen.delete(value);

    return Object.fromEntries(normalizedEntries);
  }

  return String(value);
};

export const createStableKey = (value: unknown) => {
  return JSON.stringify(normalizeForStableKey(value, new WeakSet<object>()));
};

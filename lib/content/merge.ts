function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Fills missing fields from defaults while preserving stored values.
 * Arrays and primitives replace the default; objects merge recursively.
 */
export function mergeDefaults<T>(defaults: T, value: unknown): T {
  if (value === undefined) return defaults;
  if (Array.isArray(defaults)) {
    return (Array.isArray(value) ? value : defaults) as T;
  }
  if (isPlainObject(defaults) && isPlainObject(value)) {
    const result: Record<string, unknown> = { ...defaults };
    for (const [key, stored] of Object.entries(value)) {
      result[key] =
        key in (defaults as Record<string, unknown>)
          ? mergeDefaults(
              (defaults as Record<string, unknown>)[key],
              stored,
            )
          : stored;
    }
    return result as T;
  }
  return value as T;
}

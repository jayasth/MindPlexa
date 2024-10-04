// Convert snake_case to camelCase
export const toCamelCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: Record<string, unknown>, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
      return result;
    }, {});
  }
  return obj;
};

// Convert camelCase to snake_case
export const toSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: Record<string, unknown>, key) => {
      const snakeKey = key.replace(/([A-Z])/g, (g) => `_${g.toLowerCase()}`);
      result[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
      return result;
    }, {});
  }
  return obj;
};

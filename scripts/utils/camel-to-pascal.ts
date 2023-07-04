/**
 * Convert camelCase to PascalCase
 */
export default (camelCase: string): string => camelCase[0].toUpperCase() + camelCase.slice(1)
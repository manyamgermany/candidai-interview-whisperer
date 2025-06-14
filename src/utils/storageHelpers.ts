
/**
 * Utility functions for storage operations
 */

export const isExtensionContext = (): boolean => {
  return typeof window !== 'undefined' && 
         window.chrome && 
         window.chrome.storage && 
         window.chrome.runtime && 
         typeof window.chrome.runtime.id !== 'undefined';
};

export const createStorageError = (operation: string, error: unknown): Error => {
  const message = error instanceof Error ? error.message : 'Unknown storage error';
  return new Error(`Failed to ${operation}: ${message}`);
};

export const limitArraySize = <T>(array: T[], maxSize: number): T[] => {
  return array.slice(0, maxSize);
};

export const calculateStorageUsage = (data: string): number => {
  return data.length * 2; // Rough estimate for UTF-16 encoding
};

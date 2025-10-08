// Icon cache utilities for SafeIcon component
// Separated to maintain Fast Refresh compatibility

import React from 'react';

// Cache for loaded icon components to prevent re-creating lazy components
export const iconCache = new Map<string, React.LazyExoticComponent<React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>>>();

/**
 * Utility function to clear icon cache
 * Useful for testing or memory management
 */
export const clearIconCache = (): void => {
  iconCache.clear();
};

/**
 * Utility function to get current cache size
 * Useful for debugging and monitoring
 */
export const getIconCacheSize = (): number => iconCache.size;

/**
 * Utility function to check if an icon is cached
 */
export const isIconCached = (iconName: string): boolean => {
  return iconCache.has(iconName);
};

/**
 * Utility function to remove a specific icon from cache
 */
export const removeIconFromCache = (iconName: string): boolean => {
  return iconCache.delete(iconName);
};

/**
 * Utility function to get all cached icon names
 */
export const getCachedIconNames = (): string[] => {
  return Array.from(iconCache.keys());
};
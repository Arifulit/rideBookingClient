// Main exports for icon components and utilities
export { default as SafeIcon } from './SafeIcon';
export { 
  SafeFingerprintIcon, 
  SafeShieldIcon, 
  SafeLockIcon, 
  SafeUserIcon 
} from './SafeIcon';

export { default as IconErrorBoundary } from './IconErrorBoundary';

export {
  DashboardIcon,
  UserIcon,
  RideIcon,
  AnalyticsIcon,
  SettingsIcon,
  BookRideIcon,
  EarningsIcon,
  FingerprintIcon,
  SecurityIcon
} from './FallbackIcons';

export {
  clearIconCache,
  getIconCacheSize,
  isIconCached,
  removeIconFromCache,
  getCachedIconNames
} from './iconCacheUtils';

// Type exports
export type { SafeIconProps } from './SafeIcon';
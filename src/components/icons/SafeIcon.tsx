import React, { lazy, Suspense, memo, useMemo } from 'react';
import IconErrorBoundary from './IconErrorBoundary';
import { FingerprintIcon, SecurityIcon, UserIcon, RideIcon } from './FallbackIcons';
import { iconCache } from './iconCacheUtils';

// Commonly blocked icon names by ad blockers and privacy extensions
const BLOCKED_ICON_NAMES = [
  'fingerprint',
  'tracking',
  'analytics',
  'pixel',
  'beacon',
  'probe',
  'monitor',
  'trace'
];

// Fallback mappings for commonly blocked icons
const FALLBACK_MAPPINGS = {
  Fingerprint: FingerprintIcon,
  Shield: SecurityIcon,
  User: UserIcon,
  Car: RideIcon,
  Lock: SecurityIcon,
};

export interface SafeIconProps extends React.SVGProps<SVGSVGElement> {
  /** The name of the Lucide React icon to load */
  name: string;
  /** Size of the icon in pixels (default: 24) */
  size?: number;
  /** Additional CSS classes to apply */
  className?: string;
  /** Custom fallback component to use if icon loading fails */
  fallback?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Cache is imported from iconCacheUtils to maintain Fast Refresh compatibility

// Generic fallback SVG component
const GenericFallback = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { size?: number; className?: string }>((
  { size = 24, className = '', ...props }, 
  ref
) => (
  <svg
    ref={ref}
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path strokeWidth={2} d="M9 9h.01" />
    <path strokeWidth={2} d="M15 9h.01" />
  </svg>
));

GenericFallback.displayName = 'GenericFallback';

/**
 * Safely loads and renders Lucide React icons with automatic fallbacks
 * for icons that might be blocked by ad blockers or privacy extensions
 */
const SafeIcon: React.FC<SafeIconProps> = memo(({ 
  name, 
  size = 24, 
  className = '', 
  fallback,
  ...props 
}) => {
  // Check if the icon name is likely to be blocked
  const isLikelyBlocked = useMemo(() => 
    BLOCKED_ICON_NAMES.some(blocked => 
      name.toLowerCase().includes(blocked.toLowerCase())
    ), [name]
  );

  // Get or create cached lazy icon component - always call hooks at top level
  const LazyIcon = useMemo(() => {
    if (iconCache.has(name)) {
      return iconCache.get(name)!;
    }

    const lazyIcon = lazy(async () => {
      try {
        const icons = await import('lucide-react');
        const IconComponent = icons[name as keyof typeof icons] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        
        if (!IconComponent || typeof IconComponent !== 'function') {
          throw new Error(`Icon "${name}" not found or is not a valid component`);
        }
        
        return { 
          default: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((iconProps, ref) => (
            <IconComponent 
              width={size} 
              height={size} 
              className={className} 
              ref={ref} 
              {...iconProps} 
            />
          ))
        };
      } catch (error) {
        console.warn(`Failed to load icon "${name}":`, error instanceof Error ? error.message : String(error));
        
        // Return generic fallback component
        return {
          default: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((iconProps, ref) => (
            <GenericFallback
              ref={ref}
              size={size}
              className={className}
              {...iconProps}
            />
          ))
        };
      }
    });

    iconCache.set(name, lazyIcon);
    return lazyIcon;
  }, [name, size, className]);

  // Filter out custom props that shouldn't be passed to SVG elements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { size: _size, className: _className, fallback: _fallback, name: _name, ref, ...restProps } = { size, className, fallback, name, ...props };
  
  // Type-safe props for SVG elements (excluding ref which is handled by forwardRef)
  const svgProps: Omit<React.SVGProps<SVGSVGElement>, 'ref'> = restProps;

  // Use fallback for likely blocked icons - return early after hooks
  if (isLikelyBlocked || FALLBACK_MAPPINGS[name as keyof typeof FALLBACK_MAPPINGS]) {
    const FallbackComponent = fallback || FALLBACK_MAPPINGS[name as keyof typeof FALLBACK_MAPPINGS];
    
    if (FallbackComponent) {
      return (
        <FallbackComponent 
          size={size} 
          className={className}
          {...props}
        />
      );
    }
  }

  return (
    <IconErrorBoundary
      fallback={
        fallback ? (
          React.createElement(fallback, { width: size, height: size, className, ...props })
        ) : (
          <GenericFallback
            size={size}
            className={className}
            {...svgProps}
          />
        )
      }
    >
      <Suspense
        fallback={
          <div 
            className={`${className} animate-pulse bg-gray-200 dark:bg-gray-800 rounded`}
            style={{ width: size, height: size }}
            aria-label={`Loading ${name} icon`}
          />
        }
      >
        <LazyIcon {...svgProps} />
      </Suspense>
    </IconErrorBoundary>
  );
});

SafeIcon.displayName = 'SafeIcon';

export default SafeIcon;

// Export pre-configured safe versions of commonly problematic icons
export const SafeFingerprintIcon: React.FC<Omit<SafeIconProps, 'name'>> = (props) => (
  <SafeIcon name="Fingerprint" {...props} />
);

export const SafeShieldIcon: React.FC<Omit<SafeIconProps, 'name'>> = (props) => (
  <SafeIcon name="Shield" {...props} />
);

export const SafeLockIcon: React.FC<Omit<SafeIconProps, 'name'>> = (props) => (
  <SafeIcon name="Lock" {...props} />
);

export const SafeUserIcon: React.FC<Omit<SafeIconProps, 'name'>> = (props) => (
  <SafeIcon name="User" {...props} />
);
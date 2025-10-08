/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?: number;
  fallback?: React.ComponentType<any>;
}

// Fallback icons for commonly blocked icon names
const FallbackIcons = {
  Fingerprint: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
      />
    </svg>
  ),
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Lock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Car: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-3 3-3-3m0 0V7m3 7H8a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2z"
      />
    </svg>
  ),
};

const IconWrapper: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className, 
  fallback,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when name changes
    setHasError(false);
  }, [name]);

  // If there's an error or the icon is commonly blocked, use fallback
  if (hasError || ['Fingerprint', 'Shield', 'Lock'].includes(name)) {
    const FallbackIcon = fallback || FallbackIcons[name as keyof typeof FallbackIcons];
    
    if (FallbackIcon) {
      return (
        <FallbackIcon 
          width={size} 
          height={size} 
          className={className}
          {...props}
        />
      );
    }
    
    // Generic fallback
    return (
      <svg
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
    );
  }

  try {
    const Icon = LucideIcons[name] as React.ComponentType<any>;
    
    if (!Icon) {
      setHasError(true);
      return null;
    }

    return (
      <Icon
        size={size}
        className={className}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  } catch (error) {
    console.warn(`Failed to load icon: ${name}`, error);
    setHasError(true);
    return null;
  }
};

// Export commonly used icons with safe fallbacks
export const SafeFingerprint: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <IconWrapper name="Fingerprint" {...props} />
);

export const SafeShield: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <IconWrapper name="Shield" {...props} />
);

export const SafeLock: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <IconWrapper name="Lock" {...props} />
);

export const SafeUser: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <IconWrapper name="User" {...props} />
);

export default IconWrapper;
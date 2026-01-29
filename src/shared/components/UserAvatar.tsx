import React from 'react';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'solid' | 'outline';
  className?: string;
}

const sizeMap = {
  sm: { container: 32, font: 12, radius: 8 },
  md: { container: 44, font: 15, radius: 12 },
  lg: { container: 64, font: 22, radius: 16 },
  xl: { container: 88, font: 32, radius: 24 },
};

// Generate display text from available user info
const getDisplayText = (firstName?: string, lastName?: string, username?: string): string => {
  // Try initials from first and last name
  const firstInitial = firstName?.[0]?.toUpperCase();
  const lastInitial = lastName?.[0]?.toUpperCase();

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }

  // If only first name available
  if (firstInitial) {
    return firstInitial;
  }

  // If only last name available
  if (lastInitial) {
    return lastInitial;
  }

  // Fallback to username initials (first 2 chars)
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }

  // Final fallback
  return '?';
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName = '',
  lastName = '',
  username = '',
  size = 'md',
  variant = 'gradient',
  className,
}) => {
  const displayText = getDisplayText(firstName, lastName, username);
  const dimensions = sizeMap[size];

  const getStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: dimensions.container,
      height: dimensions.container,
      minWidth: dimensions.container,
      borderRadius: dimensions.radius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: dimensions.font,
      fontWeight: 700,
      letterSpacing: '-0.5px',
      position: 'relative',
      overflow: 'hidden',
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #70CC60 0%, #5cb84e 100%)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(112, 204, 96, 0.3)',
        };
      case 'solid':
        return {
          ...baseStyles,
          backgroundColor: 'var(--labgate-brand)',
          color: '#ffffff',
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'var(--labgate-brand-light, #E8F8E5)',
          color: 'var(--labgate-brand)',
          border: '2px solid var(--labgate-brand)',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div style={getStyles()} className={className}>
      {displayText}
      {/* Subtle shine effect for gradient variant */}
      {variant === 'gradient' && (
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            right: '50%',
            bottom: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            borderRadius: `${dimensions.radius * 0.6}px`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

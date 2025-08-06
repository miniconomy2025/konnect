"use client";

import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { Layout, Typography, Buttons, StyleHelpers } from '@/lib/sharedStyles';

interface HeaderAction {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

interface HeaderProps {
  /** Header title - can be string or custom element */
  title?: string | React.ReactNode;
  /** Show the Konnect branding instead of title */
  showBranding?: boolean;
  /** Left side action (typically back button) */
  leftAction?: HeaderAction;
  /** Right side action (typically settings) */
  rightAction?: HeaderAction;
  /** Additional right side actions */
  rightActions?: HeaderAction[];
  /** Make header transparent with blur effect */
  transparent?: boolean;
  /** Custom styling */
  style?: React.CSSProperties;
  /** Show bottom border */
  showBorder?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBranding = false,
  leftAction,
  rightAction,
  rightActions = [],
  transparent = false,
  style = {},
  showBorder = true,
}) => {
  const allRightActions = rightAction ? [rightAction, ...rightActions] : rightActions;

  const headerStyle = StyleHelpers.combine(
    {
      position: 'sticky' as const,
      top: 0,
      zIndex: 200,
      height: '3.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${Spacing.Medium} ${Spacing.Large}`,
      borderBottom: showBorder ? `1px solid ${Color.Border}` : 'none',
    },
    transparent
      ? {
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }
      : {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
    style
  );

  const brandingStyle = StyleHelpers.combine(Typography.h1, {
    fontSize: FontSize.XLarge,
    fontWeight: 400,
    fontFamily: FontFamily.Playwrite,
    color: Color.Text,
  });

  const titleStyle = StyleHelpers.combine(Typography.h1, {
    fontSize: FontSize.Large,
    fontWeight: 600,
    color: Color.Text,
    textAlign: 'center' as const,
  });

  const actionButtonStyle = StyleHelpers.combine(Buttons.icon, {
    padding: Spacing.Small,
    borderRadius: '0.5rem',
    color: Color.Text,
    transition: 'all 0.2s ease',
  });

  const renderTitle = () => {
    if (showBranding) {
      return (
        <h1 style={brandingStyle}>
          Konnect
        </h1>
      );
    }

    if (typeof title === 'string') {
      return (
        <h1 style={titleStyle}>
          {title}
        </h1>
      );
    }

    return title;
  };

  return (
    <header style={headerStyle}>
      {/* Left Section */}
      <section style={{ display: 'flex', alignItems: 'center', minWidth: '3rem' }}>
        {leftAction && (
          <button
            onClick={leftAction.onClick}
            style={actionButtonStyle}
            aria-label={leftAction.label}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = Color.Background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {leftAction.icon}
          </button>
        )}
      </section>

      {/* Center Section - Title or Branding */}
      <section 
        style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {renderTitle()}
      </section>

      {/* Right Section */}
      <section 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: Spacing.Small,
          minWidth: '3rem',
          justifyContent: 'flex-end',
        }}
      >
        {allRightActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={actionButtonStyle}
            aria-label={action.label}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = Color.Background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {action.icon}
          </button>
        ))}
      </section>
    </header>
  );
};

// Convenience components for common header patterns
export const BrandingHeader: React.FC<Omit<HeaderProps, 'showBranding'>> = (props) => (
  <Header {...props} showBranding={true} />
);

export const BackHeader: React.FC<Omit<HeaderProps, 'leftAction'> & { onBack: () => void; backLabel?: string }> = ({
  onBack,
  backLabel = "Go back",
  ...props
}) => (
  <Header
    {...props}
    leftAction={{
      icon: <ArrowLeft size={20} />,
      onClick: onBack,
      label: backLabel,
    }}
  />
);

export const SettingsHeader: React.FC<Omit<HeaderProps, 'rightAction'> & { onSettings: () => void }> = ({
  onSettings,
  ...props
}) => (
  <Header
    {...props}
    rightAction={{
      icon: <Settings size={20} />,
      onClick: onSettings,
      label: "Open settings",
    }}
  />
);

export default Header;
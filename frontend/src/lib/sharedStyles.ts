import { Color, FontFamily, Spacing } from './presentation';

// Common layout patterns
export const Layout = {
  // Main container styles
  mainContainer: {
    minHeight: '100vh',
    background: Color.Background,
    padding: Spacing.Medium,
  },
  
  // Centered container with max width
  centeredContainer: {
    maxWidth: '37.5rem', // 600px / 16px = 37.5rem
    margin: '0 auto',
  },
  
  // Flex layouts
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  
  // Grid layouts
  gridCenter: {
    display: 'grid',
    placeItems: 'center',
  },
  
  // Section containers
  section: {
    marginBottom: Spacing.Large,
  },
  
  // Card-like containers
  card: {
    background: Color.Surface,
    borderRadius: '1rem', // 16px / 16px = 1rem
    padding: Spacing.Large,
    border: `1px solid ${Color.Border}`,
    marginBottom: Spacing.Medium,
  },
  
  // Header sections
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.Large,
    paddingBottom: Spacing.Medium,
    borderBottom: `1px solid ${Color.Border}`,
  },
} as const;

// Typography styles
export const Typography = {
  // Headings
  h1: {
    margin: 0,
    fontSize: '1.25rem', // 20px / 16px = 1.25rem
    fontFamily: FontFamily.Nunito,
    fontWeight: 600,
    color: Color.Text,
  },
  
  h2: {
    margin: 0,
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
    fontWeight: 600,
    color: Color.Text,
  },
  
  h3: {
    margin: 0,
    fontSize: '0.875rem', // 14px / 16px = 0.875rem
    fontFamily: FontFamily.Nunito,
    fontWeight: 600,
    color: Color.Text,
  },
  
  // Body text
  body: {
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
    color: Color.Text,
    lineHeight: 1.5,
  },
  
  bodySmall: {
    fontSize: '0.875rem', // 14px / 16px = 0.875rem
    fontFamily: FontFamily.Nunito,
    color: Color.Text,
    lineHeight: 1.4,
  },
  
  // Muted text
  muted: {
    fontSize: '0.875rem', // 14px / 16px = 0.875rem
    fontFamily: FontFamily.Nunito,
    color: Color.Muted,
  },
  
  // Caption text
  caption: {
    fontSize: '0.875rem', // 14px / 16px = 0.875rem
    fontFamily: FontFamily.Nunito,
    color: Color.Muted,
    margin: `${Spacing.Small} 0 0 0`,
  },
} as const;

// Button styles
export const Buttons = {
  // Base button styles
  base: {
    border: 'none',
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Primary button
  primary: {
    background: Color.Primary,
    color: Color.Surface,
    padding: `${Spacing.Small} ${Spacing.Medium}`,
  },
  
  // Secondary button
  secondary: {
    background: Color.Surface,
    color: Color.Primary,
    border: `1px solid ${Color.Primary}`,
    padding: `${Spacing.Small} ${Spacing.Medium}`,
  },
  
  // Ghost button (transparent background)
  ghost: {
    background: 'none',
    color: Color.Muted,
    padding: Spacing.Small,
    borderRadius: '0.25rem', // 4px / 16px = 0.25rem
  },
  
  // Danger button
  danger: {
    background: Color.Error,
    color: Color.Surface,
    padding: `${Spacing.Small} ${Spacing.Medium}`,
  },
  
  // Icon button
  icon: {
    background: 'none',
    border: 'none',
    color: Color.Muted,
    cursor: 'pointer',
    padding: Spacing.Small,
    borderRadius: '0.25rem', // 4px / 16px = 0.25rem
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  
  // Disabled state
  disabled: {
    background: Color.Muted,
    color: Color.Surface,
    cursor: 'not-allowed',
  },
} as const;

// Form styles
export const Forms = {
  // Input containers
  inputContainer: {
    marginBottom: Spacing.Medium,
  },
  
  // Text inputs
  input: {
    width: '100%',
    padding: `${Spacing.Small} ${Spacing.Medium}`,
    border: `1px solid ${Color.Border}`,
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
    color: Color.Text,
    background: Color.Surface,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  
  // Textarea
  textarea: {
    width: '100%',
    minHeight: '7.5rem', // 120px / 16px = 7.5rem
    padding: `${Spacing.Small} ${Spacing.Medium}`,
    border: `1px solid ${Color.Border}`,
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
    color: Color.Text,
    background: Color.Surface,
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    transition: 'border-color 0.2s ease',
  },
  
  // File input
  fileInput: {
    display: 'none',
  },
  
  // Label
  label: {
    display: 'block',
    fontSize: '0.875rem', // 14px / 16px = 0.875rem
    fontFamily: FontFamily.Nunito,
    fontWeight: 500,
    color: Color.Text,
    marginBottom: Spacing.Small,
  },
  
  // Error message
  error: {
    background: Color.Error,
    color: Color.Surface,
    padding: Spacing.Medium,
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
    marginBottom: Spacing.Medium,
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
  },
  
  // Success message
  success: {
    background: Color.Success,
    color: Color.Surface,
    padding: Spacing.Medium,
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
    marginBottom: Spacing.Medium,
    fontSize: '1rem', // 16px / 16px = 1rem
    fontFamily: FontFamily.Nunito,
  },
} as const;

// Interactive elements
export const Interactive = {
  // Hover effects
  hoverScale: {
    transition: 'transform 0.2s ease',
  },
  
  hoverScaleValue: 'scale(1.05)',
  
  // Focus states
  focusRing: {
    outline: 'none',
    boxShadow: `0 0 0 0.125rem ${Color.Primary}40`, // 2px / 16px = 0.125rem
  },
  
  // Transitions
  transition: {
    transition: 'all 0.2s ease',
  },
  
  transitionFast: {
    transition: 'all 0.1s ease',
  },
  
  transitionSlow: {
    transition: 'all 0.3s ease',
  },
} as const;

// Media styles
export const Media = {
  // Image containers
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
  },
  
  // Responsive images
  image: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
  },
  
  // Avatar images
  avatar: {
    width: '2.5rem', // 40px / 16px = 2.5rem
    height: '2.5rem', // 40px / 16px = 2.5rem
    borderRadius: '50%',
    objectFit: 'cover',
  },
  
  // Large avatar
  avatarLarge: {
    width: '5rem', // 80px / 16px = 5rem
    height: '5rem', // 80px / 16px = 5rem
    borderRadius: '50%',
    objectFit: 'cover',
  },
  
  // Video
  video: {
    width: '100%',
    maxHeight: '25rem', // 400px / 16px = 25rem
    borderRadius: '0.5rem', // 8px / 16px = 0.5rem
  },
} as const;

// Utility styles
export const Utils = {
  // Text alignment
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  // Margins
  marginTop: {
    marginTop: Spacing.Medium,
  },
  
  marginBottom: {
    marginBottom: Spacing.Medium,
  },
  
  marginLeft: {
    marginLeft: Spacing.Medium,
  },
  
  marginRight: {
    marginRight: Spacing.Medium,
  },
  
  // Padding
  padding: {
    padding: Spacing.Medium,
  },
  
  paddingSmall: {
    padding: Spacing.Small,
  },
  
  paddingLarge: {
    padding: Spacing.Large,
  },
  
  // Display
  hidden: {
    display: 'none',
  },
  
  visible: {
    display: 'block',
  },
  
  // Position
  relative: {
    position: 'relative',
  },
  
  absolute: {
    position: 'absolute',
  },
  
  fixed: {
    position: 'fixed',
  },
  
  // Z-index
  zIndex: {
    zIndex: 1000,
  },
  
  zIndexHigh: {
    zIndex: 9999,
  },
} as const;

// Combined style helpers
export const StyleHelpers = {
  // Combine multiple styles
  combine: (...styles: React.CSSProperties[]) => {
    return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
  },
  
  // Create button with variant
  createButton: (variant: keyof typeof Buttons, additionalStyles?: React.CSSProperties) => {
    return StyleHelpers.combine(Buttons.base, Buttons[variant], additionalStyles || {});
  },
  
  // Create text with variant
  createText: (variant: keyof typeof Typography, additionalStyles?: React.CSSProperties) => {
    return StyleHelpers.combine(Typography[variant], additionalStyles || {});
  },
  
  // Create layout with variant
  createLayout: (variant: keyof typeof Layout, additionalStyles?: React.CSSProperties) => {
    return StyleHelpers.combine(Layout[variant], additionalStyles || {});
  },
} as const;

// Export all styles
export const SharedStyles = {
  Layout,
  Typography,
  Buttons,
  Forms,
  Interactive,
  Media,
  Utils,
  StyleHelpers,
} as const; 
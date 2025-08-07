// Semantic color palette
export enum Color {
  Primary = "#007AFF",
  Secondary = "#5856D6",
  Background = "#fafafa",
  Surface = "#fff",
  Border = "#eee",
  Text = "#222",
  Muted = "#888",
  Error = "#FF3B30",
  Success = "#34C759",
  // Gradient colors for branding
  GradientStart = "#DF99F0",
  GradientEnd = "#4361EE",
}

// Spacing (in rem)
export enum Spacing {
  XSmall = "0.25rem",
  Small = "0.5rem",
  MediumSmall = "0.625rem",
  Medium = "1rem",
  Large = "1.5rem",
  XLarge = "2rem",
}

// Font sizes (in pt) 
export enum FontSize {
  Small = 14,
  Base = 16,
  Large = 20,
  XLarge = 28,
}

// Font sizes (in rem) for specific components  
export enum FontSizeRem {
  NavLabel = "0.75rem",
  ToastSmall = "0.8125rem",  // 13px
  ToastBase = "0.875rem",    // 14px
  ToastTitle = "0.9375rem",  // 15px
  ToastIcon = "1.125rem",    // 18px
}

// Border radius (in rem)
export enum Radius {
  Small = "0.25rem",
  Medium = "0.5rem", 
  Large = "1rem",
}

// Component sizes (in rem)
export enum ComponentSize {
  IconContainer = "2.75rem",
  ToastMinWidth = "17.5rem",    // 280px
  ToastMaxWidth = "25rem",      // 400px  
  ToastButtonSize = "1.5rem",   // 24px
  ToastProgressHeight = "0.1875rem", // 3px
  AvatarSize = "5rem",          // 80px
  ProfileInputMinHeight = "3.75rem", // 60px
}

// Border widths (in rem)
export enum BorderWidth {
  Thin = "0.0625rem", // 1px
  Medium = "0.125rem", // 2px
  Thick = "0.25rem",   // 4px
}

// Font family
export enum FontFamily {
  VarelaRound = "var(--font-varela-round), Arial, Helvetica, sans-serif",
  Playwrite = "var(--font-playwrite), cursive",
  Nunito = "var(--font-nunito), Arial, Helvetica, sans-serif"
}

// Gradient utilities
export const Gradient = {
  Brand: `linear-gradient(135deg, ${Color.GradientStart} 0%, ${Color.GradientEnd} 100%)`,
};

// Text gradient utility for easy reuse
export const textGradientStyle = {
  background: Gradient.Brand,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// Example usage object for inline styles
export const styleVars = {
  color: Color,
  spacing: Spacing,
  fontSize: FontSize,
  radius: Radius,
  componentSize: ComponentSize,
  gradient: Gradient,
};
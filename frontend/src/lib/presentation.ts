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

// Border radius (in px)
export enum Radius {
  Small = 4,
  Medium = 8,
  Large = 16,
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
  gradient: Gradient,
};
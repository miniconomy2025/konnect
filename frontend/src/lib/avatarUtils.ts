/**
 * Avatar utility functions for generating consistent colors and styles
 */

/**
 * Simple string hash function that generates consistent hash values
 * @param str - The string to hash
 * @returns A numeric hash value
 */
function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Generate a consistent background color for a user's avatar
 * @param identifier - User identifier (username or displayName)
 * @returns CSS gradient string for background
 */
export function generateAvatarColor(identifier: string): string {
  const hash = simpleHash(identifier.toLowerCase());
  
  // Generate hue from hash (0-360 degrees)
  const hue = hash % 360;
  
  // Use pleasant saturation and lightness values for good contrast
  const saturation = 65 + (hash % 20); // 65-84%
  const lightness = 45 + (hash % 15);  // 45-59%
  
  // Create a subtle gradient using HSL colors
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 20) % 360}, ${saturation - 10}%, ${lightness + 10}%)`;
  
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

/**
 * Generate consistent text color (light/dark) based on background color
 * @param identifier - User identifier (username or displayName)
 * @returns CSS color string
 */
export function generateAvatarTextColor(identifier: string): string {
  const hash = simpleHash(identifier.toLowerCase());
  const lightness = 45 + (hash % 15); // Same lightness calculation as background
  
  // Return white text for darker backgrounds, dark text for lighter backgrounds
  return lightness < 55 ? '#ffffff' : '#1a1a1a';
}
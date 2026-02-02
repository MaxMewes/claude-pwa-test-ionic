/**
 * Parses Confluence/Jira-style color markup and converts to HTML spans.
 * Format: {color:#HEXCODE}text{color}
 *
 * Example:
 * Input: "{color:#dc9656}We stay up-to-date{color} with new features"
 * Output: "<span style=\"color:#dc9656\">We stay up-to-date</span> with new features"
 */
export function parseColorMarkup(content: string): string {
  if (!content) return '';

  // Regex to match {color:#HEXCODE}text{color} pattern
  // Supports both 3 and 6 character hex codes
  const colorPattern = /\{color:(#[0-9A-Fa-f]{3,6})\}([\s\S]*?)\{color\}/g;

  return content.replace(colorPattern, (_, color, text) => {
    return `<span style="color:${color}">${text}</span>`;
  });
}

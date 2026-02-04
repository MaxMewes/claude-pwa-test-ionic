import DOMPurify from 'dompurify';

/**
 * Parses Confluence/Jira-style color markup and converts to HTML spans.
 * Format: {color:#HEXCODE}text{color}
 *
 * Example:
 * Input: "{color:#dc9656}We stay up-to-date{color} with new features"
 * Output: "<span style=\"color:#dc9656\">We stay up-to-date</span> with new features"
 * 
 * Security: Uses DOMPurify to sanitize HTML output and prevent XSS attacks.
 */
export function parseColorMarkup(content: string): string {
  if (!content) return '';

  // Regex to match {color:#HEXCODE}text{color} pattern
  // Supports both 3 and 6 character hex codes
  const colorPattern = /\{color:(#[0-9A-Fa-f]{3,6})\}([\s\S]*?)\{color\}/g;

  const htmlOutput = content.replace(colorPattern, (_, color, text) => {
    // Sanitize the text content first to prevent XSS in nested content
    const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    return `<span style="color:${color}">${sanitizedText}</span>`;
  });

  // Sanitize the entire HTML output, allowing only span tags with color styles
  return DOMPurify.sanitize(htmlOutput, {
    ALLOWED_TAGS: ['span'],
    ALLOWED_ATTR: ['style'],
  });
}

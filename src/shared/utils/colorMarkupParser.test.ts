import { describe, it, expect } from 'vitest';
import { parseColorMarkup } from './colorMarkupParser';

describe('parseColorMarkup', () => {
  describe('basic functionality', () => {
    it('should return empty string for empty input', () => {
      expect(parseColorMarkup('')).toBe('');
    });

    it('should return empty string for null/undefined input', () => {
      expect(parseColorMarkup(null as unknown as string)).toBe('');
      expect(parseColorMarkup(undefined as unknown as string)).toBe('');
    });

    it('should return unchanged text when no color markup is present', () => {
      const input = 'This is plain text without any markup';
      expect(parseColorMarkup(input)).toBe(input);
    });
  });

  describe('color markup parsing', () => {
    it('should parse single color markup with 6-digit hex code', () => {
      const input = '{color:#dc9656}colored text{color}';
      const expected = '<span style="color:#dc9656">colored text</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should parse single color markup with 3-digit hex code', () => {
      const input = '{color:#f00}red text{color}';
      const expected = '<span style="color:#f00">red text</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should parse color markup with surrounding text', () => {
      const input = 'Before {color:#dc9656}colored{color} after';
      const expected = 'Before <span style="color:#dc9656">colored</span> after';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should parse multiple color markups in same text', () => {
      const input = '{color:#ff0000}red{color} and {color:#00ff00}green{color}';
      const expected = '<span style="color:#ff0000">red</span> and <span style="color:#00ff00">green</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should handle uppercase hex codes', () => {
      const input = '{color:#AABBCC}text{color}';
      const expected = '<span style="color:#AABBCC">text</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should handle mixed case hex codes', () => {
      const input = '{color:#AaBbCc}text{color}';
      const expected = '<span style="color:#AaBbCc">text</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });
  });

  describe('multiline content', () => {
    it('should handle multiline text within color markup', () => {
      const input = '{color:#123456}line1\nline2{color}';
      const expected = '<span style="color:#123456">line1\nline2</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should handle color markup spanning multiple lines', () => {
      const input = `Before
{color:#ff0000}This is
multiline
colored text{color}
After`;
      const expected = `Before
<span style="color:#ff0000">This is
multiline
colored text</span>
After`;
      expect(parseColorMarkup(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should not parse incomplete color markup (missing closing tag)', () => {
      const input = '{color:#ff0000}unclosed text';
      expect(parseColorMarkup(input)).toBe(input);
    });

    it('should not parse incomplete color markup (missing opening tag)', () => {
      const input = 'text{color}';
      expect(parseColorMarkup(input)).toBe(input);
    });

    it('should handle empty content within color tags', () => {
      const input = '{color:#ff0000}{color}';
      const expected = '<span style="color:#ff0000"></span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should handle special characters within colored text', () => {
      const input = '{color:#ff0000}<>&"\'special chars{color}';
      const expected = '<span style="color:#ff0000"><>&"\'special chars</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should handle nested-looking markup (only outermost applies)', () => {
      const input = '{color:#ff0000}outer {color:#00ff00}inner{color} text{color}';
      // The regex is non-greedy, so it matches the first complete pair
      const result = parseColorMarkup(input);
      expect(result).toContain('<span style="color:#ff0000">');
    });

    it('should handle adjacent color markups', () => {
      const input = '{color:#ff0000}red{color}{color:#00ff00}green{color}';
      const expected = '<span style="color:#ff0000">red</span><span style="color:#00ff00">green</span>';
      expect(parseColorMarkup(input)).toBe(expected);
    });
  });

  describe('real-world examples', () => {
    it('should parse typical news content with highlights', () => {
      const input = 'We are pleased to announce that {color:#dc9656}new laboratory services{color} are now available.';
      const expected = 'We are pleased to announce that <span style="color:#dc9656">new laboratory services</span> are now available.';
      expect(parseColorMarkup(input)).toBe(expected);
    });

    it('should parse content with multiple highlighted sections', () => {
      const input = '{color:#FF5733}Important:{color} Please review the {color:#28A745}new guidelines{color} before proceeding.';
      const expected = '<span style="color:#FF5733">Important:</span> Please review the <span style="color:#28A745">new guidelines</span> before proceeding.';
      expect(parseColorMarkup(input)).toBe(expected);
    });
  });
});

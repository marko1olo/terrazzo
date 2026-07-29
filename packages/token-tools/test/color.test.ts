import { describe, expect, it } from 'vitest';

import { COLOR_SPACE, parseColor, tokenToColor } from '../src/color.js';

describe('parseColor', () => {
  const tests: [string, string][] = [
    ['#663399', 'srgb'],
    ['color(a98-rgb 0.4 0.2 0.6)', 'a98-rgb'],
    ['color(display-p3 0.4 0.2 0.6)', 'display-p3'],
    ['color(prophoto-rgb 0.4 0.2 0.6)', 'prophoto-rgb'],
    ['color(xyz 0.2005 0.14089 0.4472)', 'xyz-d65'],
    ['color(--okhsv 218 50% 67%)', 'okhsv'],
    ['oklch(90% 0.1 40)', 'oklch'],
  ];

  it.each(tests)('%s', (given, want) => {
    expect(parseColor(given).colorSpace).toBe(want);
  });

  it('returns a colorSpace tokenToColor accepts', () => {
    for (const [given] of tests) {
      const value = parseColor(given);
      expect(Object.keys(COLOR_SPACE)).toContain(value.colorSpace);
      expect(() => tokenToColor(value)).not.toThrow();
    }
  });
});

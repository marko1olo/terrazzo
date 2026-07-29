import type { Logger } from '@terrazzo/parser';
import type { TokenTransformed } from '@terrazzo/token-tools';
import { describe, expect, it } from 'vitest';

import generateUtilityCSS from '../src/utility-css.js';

/** Only the fields generateUtilityCSS() reads. */
function token(id: string, $type: string): TokenTransformed {
  return { token: { id, $type }, localID: id.replaceAll('.', '-') } as unknown as TokenTransformed;
}

function collectingLogger() {
  const warnings: string[] = [];
  const logger = {
    warn({ message }: { message: string }) {
      warnings.push(message);
    },
    debug() {},
    error() {},
    info() {},
    setLevel() {},
  } as unknown as Logger;
  return { logger, warnings };
}

describe('generateUtilityCSS', () => {
  it('keeps emitting later groups when an earlier one matches nothing', () => {
    const tokens = [token('color.primary', 'color'), token('shadow.md', 'shadow')];

    // "bg" and "shadow" both match, "border" matches nothing. Groups are visited in
    // sorted order, so "border" falls between the two that do match.
    const empty = collectingLogger();
    const withEmptyGroup = generateUtilityCSS(
      { bg: ['color.**'], border: ['border.**'], shadow: ['shadow.**'] },
      tokens,
      { logger: empty.logger },
    );

    const baseline = collectingLogger();
    const withoutEmptyGroup = generateUtilityCSS(
      { bg: ['color.**'], shadow: ['shadow.**'] },
      tokens,
      { logger: baseline.logger },
    );

    // Declaring a group that matches nothing warns, and changes nothing else.
    expect(empty.warnings).toEqual(['utility group "border" matched 0 tokens: ["border.**"]']);
    expect(baseline.warnings).toEqual([]);
    expect(withEmptyGroup).toEqual(withoutEmptyGroup);
    expect(withEmptyGroup).toHaveLength(2);
  });
});

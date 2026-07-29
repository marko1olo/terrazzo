import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';

import css, { type CSSPluginOptions } from '../src/index.js';

const TOKENS = {
  typography: {
    'page-title': {
      $type: 'typography',
      $value: {
        fontFamily: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        fontSize: { value: 48, unit: 'px' },
        fontWeight: 600,
        lineHeight: 1.25,
      },
    },
  },
};

/** Every name registered by an `@property` at-rule. */
function registeredProperties(cssText: string): string[] {
  return [...cssText.matchAll(/@property\s+(--[^\s{]+)/g)].map((match) => match[1]!);
}

/** Every custom property actually declared (left-hand side of a declaration). */
function declaredProperties(cssText: string): string[] {
  return [...cssText.matchAll(/^\s*(--[^\s:]+)\s*:/gm)].map((match) => match[1]!);
}

async function buildCSS(options: CSSPluginOptions): Promise<string> {
  const config = defineConfig(
    {
      lint: { rules: { 'core/consistent-naming': 'off' } },
      plugins: [css({ filename: 'index.css', ...options })],
    },
    { cwd: new URL('./', import.meta.url) },
  );
  const { tokens, resolver, sources } = await parse(
    [{ filename: new URL('./typography.tokens.json', import.meta.url), src: TOKENS }],
    { config },
  );
  const result = await build(tokens, { resolver, sources, config });
  return result.outputFiles.find((file) => file.filename === 'index.css')!.contents.toString();
}

describe('propertyDefinitions', () => {
  it('registers the sub value names subValueVariableName produced', async () => {
    const contents = await buildCSS({
      propertyDefinitions: true,
      subValueVariableName: (variableName, subValueName) => `${variableName}__${subValueName}`,
    });

    expect(contents).toContain('@property --typography-page-title__font-size {');
    expect(contents).toContain('--typography-page-title__font-size: 48px;');
    expect(registeredProperties(contents)).not.toContain('--typography-page-title-font-size');

    // every registered property must be one the stylesheet actually declares
    const declared = new Set(declaredProperties(contents));
    expect(registeredProperties(contents).length).toBeGreaterThan(1);
    expect(registeredProperties(contents).filter((name) => !declared.has(name))).toEqual([]);
  });

  it('appends sub value names with a hyphen by default', async () => {
    const contents = await buildCSS({ propertyDefinitions: true });

    expect(contents).toContain('@property --typography-page-title-font-size {');
    const declared = new Set(declaredProperties(contents));
    expect(registeredProperties(contents).filter((name) => !declared.has(name))).toEqual([]);
  });
});

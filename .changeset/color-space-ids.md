---
"@terrazzo/token-tools": patch
---

Fix three cases where a color outside the sRGB gamut aborted the CSS build instead of producing the documented `srgb`/`p3`/`rec2020` cascade: colors in `display-p3`, `a98-rgb` or `prophoto-rgb`, border tokens with any wide-gamut color, and `okhsv` colors written in string form. Border tokens now get the same gamut fallbacks that an equivalent standalone color or shadow token already got.

Previously each of these tripped over a different confusion between the three names a color space carries — the DTCG `colorSpace` name, Color.js’ space id, and the CSS `color()` id. `downsample()` handed the DTCG name to Color.js, whose registry is keyed by space id, so `display-p3` (id `p3`), `a98-rgb` (`a98rgb`) and `prophoto-rgb` (`prophoto`) failed with `No color space found with id = "display-p3"`. `transformBorder()` asked `inGamut()` about the hardcoded string `'display-p3'`, so the branch that emits the cascade — reached only when the border color is outside sRGB — had never once run. And `parseColor()` reported a color space of `--okhsv`, the CSS custom color space syntax, which no consumer of the normalized token accepts, so Terrazzo’s own `okhsv` output did not round-trip back through its own parser.

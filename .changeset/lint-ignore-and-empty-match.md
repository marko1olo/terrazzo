---
"@terrazzo/parser": patch
---

`core/consistent-naming` now honours its `ignore` option, and `core/required-modes` reports a `match` that selects no tokens.

`consistent-naming` declared `ignore` and documented it, but never built a matcher from it, so the option was accepted and discarded — it is now applied the same way the other rules apply theirs.

`required-modes` tested `!tokensMatched` inside the loop that sets it, one line after the assignment, so the report could never fire: when the glob matched, the flag was already true, and when it matched nothing the loop body never ran. A typo in a `match` glob silently turned the rule into a no-op. The check has moved out of the loop, matching `core/required-children`.

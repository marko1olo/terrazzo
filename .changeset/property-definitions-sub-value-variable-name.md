---
"@terrazzo/plugin-css": patch
---

Honor `subValueVariableName` when generating `@property` definitions, so `propertyDefinitions` registers the custom properties the stylesheet actually declares.

Previously the `@property` generator joined a token's variable name and its sub value name with a hardcoded hyphen, while every declaration emitter routed the same pair through `subValueVariableName`. A config that renames sub values — for example appending them with `__` — therefore emitted `@property --typography-page-title-font-size` next to a `--typography-page-title__font-size` declaration, so each sub value silently lost its `syntax`, `inherits`, and `initial-value` registration: an `@property` for a name nothing declares is not an error, it simply has no effect.

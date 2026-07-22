# FLUXA Design System Foundation

Phase 2 formalizes the visual system that all future portals must inherit.

## Visual Principles

- Deep black application canvas.
- Cyan and magenta ambient lighting.
- Frosted glass surfaces with soft borders and restrained glow.
- Generous spacing and rounded geometry.
- Minimal motion with premium easing.
- Status colors must be semantic and consistent.

## Core Tokens

Design tokens are centralized in `constants/design-tokens.ts`, Tailwind theme extensions, and global CSS variables. Pages should not introduce one-off colors, shadows, radii, or motion curves.

## Component Rules

- Use `Card` or `GlassPanel` for elevated surfaces.
- Use `Button` variants instead of custom button classes.
- Use `Badge` and `StatusBadge` for status UI.
- Use `MetricCard` for dashboard KPI values.
- Use shared navigation primitives for portal shells.

## Accessibility Rules

- Interactive elements must expose accessible names.
- Status UI must use text labels, not color alone.
- Motion must stay subtle and should be reduced in future reduced-motion handling.
- Controls must preserve visible focus states.

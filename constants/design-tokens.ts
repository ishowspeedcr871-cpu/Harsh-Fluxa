export const fluxaDesignTokens = {
  color: {
    background: {
      black: "hsl(var(--background))",
      elevated: "hsl(var(--surface-elevated))",
      glass: "hsl(var(--surface-glass) / <alpha-value>)",
    },
    accent: {
      cyan: "hsl(var(--accent-cyan))",
      magenta: "hsl(var(--accent-magenta))",
    },
    semantic: {
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      danger: "hsl(var(--danger))",
      info: "hsl(var(--accent-cyan))",
    },
  },
  radius: {
    surface: "1.75rem",
    control: "999px",
    panel: "2rem",
  },
  motion: {
    fast: 0.16,
    normal: 0.28,
    slow: 0.42,
    easing: [0.22, 1, 0.36, 1],
  },
} as const;

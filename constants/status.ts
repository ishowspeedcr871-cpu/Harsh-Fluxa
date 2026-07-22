export type FluxaStatusTone = "cyan" | "magenta" | "success" | "warning" | "danger" | "muted";

export const statusToneMap = {
  draft: "muted",
  uploaded: "cyan",
  validating: "cyan",
  processing: "cyan",
  queued: "magenta",
  assigned: "magenta",
  printing: "warning",
  ready: "success",
  otp_generated: "magenta",
  collected: "success",
  completed: "success",
  cancelled: "muted",
  failed: "danger",
  online: "success",
  busy: "magenta",
  offline: "muted",
  alert: "warning",
} satisfies Record<string, FluxaStatusTone>;

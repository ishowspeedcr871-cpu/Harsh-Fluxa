"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
    >
      <Printer className="size-3.5" />
      <span>Print Receipt</span>
    </button>
  );
}

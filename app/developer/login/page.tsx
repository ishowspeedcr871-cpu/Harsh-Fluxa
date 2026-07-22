"use client";

import { useState } from "react";
import { Terminal, KeyRound, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { developerLoginAction } from "./actions";

export default function DeveloperLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await developerLoginAction(formData);
      if (result && result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center p-4 md:p-6 relative overflow-x-hidden font-sans select-none w-full">
      {/* Background radial glowing gradients matching the FLUXA look */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-cyan/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent-magenta/10 blur-[130px] pointer-events-none" />

      {/* Main card panel */}
      <div className="w-full max-w-md rounded-[30px] p-[1.5px] bg-gradient-to-br from-accent-cyan via-accent-cyan/30 to-accent-magenta shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden transition-all duration-300">
        <div className="rounded-[29px] bg-[#0c0c11]/95 backdrop-blur-md p-8 flex flex-col items-center relative overflow-hidden">
          {/* Grid background effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

          {/* FLUXA Logo */}
          <div className="mb-6 mt-2 text-center">
            <span className="text-3xl font-black tracking-[0.25em] text-accent-cyan font-sans filter drop-shadow-[0_0_15px_rgba(34,211,238,0.45)]">
              FLUXΛ
            </span>
          </div>

          <div className="flex flex-col items-center text-center mt-2 mb-8">
            <h2 className="text-[22px] font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Terminal className="size-5 text-accent-cyan" />
              <span>Master Developer Portal</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-[280px]">
              Authenticate using your master credentials to access internal tools, audit logs, and organization services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  name="masterId"
                  type="text"
                  placeholder="Master Developer ID"
                  required
                  autoFocus
                  className="h-12 rounded-2xl border-white/10 bg-black/40 text-white placeholder-muted-foreground text-xs font-semibold focus-visible:ring-accent-cyan pl-4"
                />
              </div>

              <div className="relative">
                <Input
                  name="password"
                  type="password"
                  placeholder="Master Password"
                  required
                  className="h-12 rounded-2xl border-white/10 bg-black/40 text-white placeholder-muted-foreground text-xs font-semibold focus-visible:ring-accent-cyan pl-4"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-[#f87171] bg-[#f87171]/5 border border-[#f87171]/20 p-3 rounded-xl w-full">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black text-xs font-black tracking-widest hover:opacity-90 shadow-lg shadow-accent-cyan/10 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? "AUTHORIZING..." : "ENTER PORTAL"}
              {!isPending && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {/* Quick Info/Help footer */}
          <div className="mt-8 border-t border-white/5 pt-5 w-full text-center">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
              SECURE DEPLOYMENT SYSTEM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

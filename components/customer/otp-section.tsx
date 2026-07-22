"use client";

import { useState, useEffect } from "react";
import { Lock, QrCode, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface OtpSectionProps {
  jobId: string;
  isCompleted: boolean;
  initialOtp?: string;
  otpHistory: any[];
  generateAction: (formData: FormData) => Promise<void>;
}

export function OtpSection({ jobId, isCompleted, initialOtp, otpHistory, generateAction }: OtpSectionProps) {
  const [otp, setOtp] = useState(initialOtp || "");
  const [isGenerating, setIsGenerating] = useState(false);

  // Clear OTP from URL if present (though we stopped putting it there, for legacy/backward compatibility)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("otp_code=")) {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("otp_code");
      if (code) setOtp(code);
      url.searchParams.delete("otp_code");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (isCompleted) {
    return (
      <Card className="border border-success/20 bg-success/5 shadow-glass rounded-3xl p-6 text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle className="size-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Order Complete</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Your physical document has been safely printed and collected.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-glass rounded-3xl p-6">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Lock className="size-32 text-accent-cyan" />
      </div>

      <div className="text-center space-y-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan">
          <QrCode className="size-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Secure Print Release</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Generate a secure 4-digit release OTP. Share this OTP with the print operator or enter it at the physical release kiosk to print your documents safely.
          </p>
        </div>

        {otp ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2rem] border border-accent-cyan/30 bg-accent-cyan/5 space-y-4"
          >
            <p className="text-xs uppercase tracking-widest text-accent-cyan font-bold">
              Secure Release OTP
            </p>
            <div className="flex justify-center gap-2 font-mono text-3xl font-extrabold text-white tracking-widest">
              {otp?.split("")?.map((digit, i) => (
                <span
                  key={i}
                  className="inline-block px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-accent-cyan shadow-glow"
                >
                  {digit}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valid for 15 minutes. Show this to release prints.
            </p>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 900, ease: "linear" }}
                className="h-full bg-accent-cyan" 
              />
            </div>
          </motion.div>
        ) : (
          <form action={async (formData) => {
            setIsGenerating(true);
            try {
              await generateAction(formData);
            } catch (error: any) {
              if (error.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                return;
              }
              console.error("OTP generation error:", error);
              alert("Failed to generate OTP. Please try again.");
            } finally {
              setIsGenerating(false);
            }
          }}>
            <input type="hidden" name="jobId" value={jobId} />
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-cyan text-black text-sm font-bold hover:bg-accent-cyan/95 shadow-lg shadow-accent-cyan/15 transition-all duration-300 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="size-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Generate Secure OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {otpHistory?.length > 0 && !otp && (
          <div className="text-left border-t border-white/5 pt-4 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Recent OTPs
            </p>
            {otpHistory?.slice(0, 1)?.map((hist) => (
              <div key={hist.id} className="flex justify-between items-center text-xs text-muted-foreground bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                <span>Status: {hist.status}</span>
                <span>{new Date(hist.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Lock, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function LoginForm({
  boundLoginAction,
  boundSignUpAction,
  error,
  portal = "customer",
  isSignupInitial = false,
  organizations = [],
}: {
  boundLoginAction: (formData: FormData) => void;
  boundSignUpAction: (formData: FormData) => void;
  error?: string;
  portal?: string;
  isSignupInitial?: boolean;
  organizations?: { id: string; name: string }[];
}) {
  const [mode, setMode] = useState<"login" | "signup">(isSignupInitial ? "signup" : "login");

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/auth/url");
      if (!response.ok) throw new Error("Failed to get auth URL");
      const { url } = await response.json();

      const authWindow = window.open(url, "oauth_popup", "width=600,height=700");
      if (!authWindow) alert("Please allow popups for this site to connect your Google account.");
    } catch (e) {
      console.error("OAuth error:", e);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        window.location.href = portal === "employee" ? "/employee" : "/customer";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [portal]);

  const isCustomerPortal = portal === "customer";

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-0 md:p-6 relative overflow-x-hidden font-sans select-none w-full">
      {/* Background radial glowing gradients matching mockup */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent-magenta/5 blur-[120px] pointer-events-none" />

      {/* Styled Responsive Device Frame */}
      <div className="w-full max-w-md md:h-[880px] h-screen md:rounded-[40px] md:border md:border-white/10 bg-black flex flex-col relative overflow-hidden shadow-2xl shadow-accent-cyan/10">
        {/* SCROLL CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 py-12 pb-24 scrollbar-hide">
          <div className="min-h-full flex flex-col items-center justify-center p-4">
            <div className="w-full rounded-[30px] p-[1.5px] bg-gradient-to-br from-accent-cyan via-accent-cyan/40 to-accent-magenta/90 shadow-[0_4px_30px_rgba(184,100,70,0.15)] relative overflow-hidden">
              <div className="rounded-[29px] bg-[#0c0c11]/95 backdrop-blur-md p-6 flex flex-col items-center relative overflow-hidden">
                {/* Backlines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

                <div className="mb-6 mt-2 text-center">
                  <span className="text-3xl font-black tracking-[0.2em] text-accent-cyan font-sans filter drop-shadow-[0_0_15px_rgba(34,211,238,0.45)]">
                    FLUXA
                  </span>
                  {portal !== "customer" && (
                    <div className="mt-1">
                      <span className="text-[8px] font-black bg-accent-magenta/20 text-accent-magenta px-2 py-0.5 rounded-full border border-accent-magenta/30 tracking-widest uppercase">
                        {portal} PORTAL
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center text-center mt-2 mb-6">
                  <h2 className="text-[23px] font-extrabold text-white tracking-tight flex items-center gap-2">
                    {mode === "login" ? (
                      <>
                        <Lock className="size-5 text-accent-cyan" />
                        <span>Secure Sign In</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-5 text-accent-magenta" />
                        <span>Create Account</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                    {mode === "login" 
                      ? "Enter credentials to unlock secure high-speed cloud print jobs." 
                      : "Join FLUXA to manage your print documents and history."}
                  </p>
                </div>

                <div className="w-full space-y-4">
                  {mode === "login" && (
                    <>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-bold tracking-wide transition-all duration-300"
                      >
                        <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                      </button>

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
                          <span className="bg-[#0c0c11] px-3 font-mono">Or connect via email</span>
                        </div>
                      </div>
                    </>
                  )}

                  <form action={mode === "login" ? boundLoginAction : boundSignUpAction} className="space-y-3.5">
                    <input type="hidden" name="portal" value={portal} />
                    
                    {mode === "signup" && (
                      <div className="space-y-1">
                        <Input
                          name="name"
                          type="text"
                          placeholder="Full Name"
                          required
                          className="h-11 rounded-2xl border-white/10 bg-black/40 text-white placeholder-muted-foreground text-xs font-medium focus-visible:ring-accent-cyan"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        autoComplete="email"
                        required
                        className="h-11 rounded-2xl border-white/10 bg-black/40 text-white placeholder-muted-foreground text-xs font-medium focus-visible:ring-accent-cyan"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        required
                        minLength={8}
                        className="h-11 rounded-2xl border-white/10 bg-black/40 text-white placeholder-muted-foreground text-xs font-medium focus-visible:ring-accent-cyan"
                      />
                    </div>

                    {mode === "signup" && (
                      <div className="space-y-1">
                        <Select name="organizationId" required>
                          <option value="" disabled selected className="bg-[#0c0c11]">Select Organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id} className="bg-[#0c0c11]">
                              {org.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-[#f87171] font-medium text-center bg-[#f87171]/5 border border-[#f87171]/20 py-2 rounded-xl">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black text-xs font-extrabold tracking-widest hover:opacity-90 shadow-lg shadow-accent-cyan/10 transition-all duration-300"
                    >
                      {mode === "login" ? "SIGN IN NOW" : "CREATE ACCOUNT"}
                    </Button>
                  </form>

                  <div className="pt-2 text-center">
                    {mode === "login" ? (
                      isCustomerPortal && (
                        <p className="text-xs text-muted-foreground">
                          Don&apos;t have an account?{" "}
                          <button 
                            onClick={() => setMode("signup")}
                            type="button"
                            className="text-accent-cyan font-bold hover:underline underline-offset-4"
                          >
                            Sign Up
                          </button>
                        </p>
                      )
                    ) : (
                      <button 
                        onClick={() => setMode("login")}
                        type="button"
                        className="flex items-center justify-center gap-2 mx-auto text-xs text-muted-foreground hover:text-white transition-colors"
                      >
                        <ArrowLeft className="size-3" />
                        <span>Back to Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

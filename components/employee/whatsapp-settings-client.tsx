"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWhatsappNumber } from "@/app/employee/settings/whatsapp/actions";
import { Loader2, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export function WhatsappSettingsClient({
  initialNumber,
}: {
  initialNumber: string | null;
}) {
  const [number, setNumber] = useState(initialNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateWhatsappNumber(number);
      setMessage("WhatsApp number updated successfully!");
      router.refresh();
    } catch (err: any) {
      setMessage("Error updating number: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Integrations
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">
          WhatsApp Settings
        </h1>
      </div>

      <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e16]/95 to-[#08080c]/98 p-6 shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.08)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/10 via-green-500/10 to-transparent rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="text-left pb-5 mb-5 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer Forwarding Number
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Set the WhatsApp number that customers will forward their documents to.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              WhatsApp Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 919999999999"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono"
              />
            </div>
            <p className="text-xs text-slate-500">
              Include country code without the plus sign.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 rounded-full bg-accent-cyan hover:bg-accent-cyan/80 text-black font-bold tracking-wide transition-all min-w-32"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
          
          {message && (
            <p className={`text-xs font-bold ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

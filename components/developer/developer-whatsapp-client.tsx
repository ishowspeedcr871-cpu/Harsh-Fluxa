"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGlobalWhatsappNumber } from "@/app/developer/whatsapp/actions";
import { Loader2, Phone, Building2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeveloperWhatsappClient({
  initialGlobalNumber,
  orgSettings,
}: {
  initialGlobalNumber: string | null;
  orgSettings: any[];
}) {
  const [globalNumber, setGlobalNumber] = useState(initialGlobalNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateGlobalWhatsappNumber(globalNumber);
      setMessage("Global WhatsApp number updated successfully!");
      router.refresh();
    } catch (err: any) {
      setMessage("Error updating number: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          WhatsApp Platform Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage the global fallback WhatsApp number and view organization-specific overrides.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="size-5 text-accent-cyan" />
          <h2 className="text-lg font-bold text-white">Global Platform Number</h2>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Default Forwarding Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500 font-mono">+</span>
              <Input
                value={globalNumber}
                onChange={(e) => setGlobalNumber(e.target.value)}
                placeholder="e.g. 919999999999"
                className="pl-7 bg-black/40 border-white/10 text-white font-mono focus:border-accent-cyan/50 transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * This acts as a fallback if an organization hasn&apos;t set their own number.
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-accent-cyan text-black hover:bg-accent-cyan/80 font-bold px-8 rounded-xl h-11"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Platform Number"}
          </Button>
          
          {message && (
            <p className={`text-xs font-bold mt-2 ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="size-5 text-accent-cyan" />
          <h2 className="text-lg font-bold text-white">Active Organization Overrides</h2>
        </div>
        
        {orgSettings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-sm text-slate-500 font-medium italic">No organizations have custom WhatsApp configurations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgSettings.map((setting) => (
              <div key={setting.id} className="group relative bg-[#0a0a0f] p-5 rounded-2xl border border-white/5 hover:border-accent-cyan/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-accent-cyan/5 flex items-center justify-center text-accent-cyan border border-accent-cyan/10">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white truncate max-w-[150px]">
                        {setting.organization?.name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                        ORG_{setting.organizationId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end text-accent-cyan mb-1">
                      <Phone className="size-3" />
                      <p className="text-sm font-mono font-bold tracking-tighter">+{setting.supportPhone}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Link</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

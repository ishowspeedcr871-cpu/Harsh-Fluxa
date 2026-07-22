"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertSecret, deleteSecret } from "@/app/developer/secrets/actions";
import { Loader2, KeyRound, Trash2, Plus, Eye, EyeOff, ShieldAlert, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface Secret {
  key: string;
  value: any;
}

export function DeveloperSecretsClient({ 
  initialSettings,
  systemSecrets = [] 
}: { 
  initialSettings: any[];
  systemSecrets?: any[];
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const allSecrets = [
    ...systemSecrets.map(s => ({ ...s, id: `system-${s.key}` })),
    ...initialSettings.map(s => ({ ...s, isSystem: false }))
  ].sort((a, b) => a.key.localeCompare(b.key));

  const handleUpsert = async (key: string, value: string) => {
    if (!key || !value) return;
    setIsLoading(true);
    try {
      await upsertSecret(key, value);
      if (key === newKey) {
        setNewKey("");
        setNewValue("");
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the secret "${key}"?`)) return;
    setIsLoading(true);
    try {
      await deleteSecret(key);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <KeyRound className="text-accent-cyan" />
            Platform Secrets Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage environment variables and API keys securely in the database.
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-4">
        <ShieldAlert className="size-5 text-yellow-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-yellow-500">Security Notice</h3>
          <p className="text-xs text-yellow-500/80 mt-1">
            These variables are stored as plain text in the `PlatformSettings` table. Ensure your database access is strictly restricted. Use these values in your code via `prisma.platformSettings.findUnique`.
          </p>
        </div>
      </div>

      {/* Add New Secret */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="size-4 text-accent-cyan" />
          Add New Secret
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Key</label>
            <Input 
              placeholder="e.g. STRIPE_SECRET_KEY"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="bg-black/40 border-white/10 text-white font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Value</label>
            <Input 
              type="password"
              placeholder="••••••••••••••••"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-black/40 border-white/10 text-white font-mono"
            />
          </div>
          <Button 
            onClick={() => handleUpsert(newKey, newValue)}
            disabled={isLoading || !newKey || !newValue}
            className="bg-accent-cyan text-black hover:bg-accent-cyan/80 font-bold h-11 rounded-xl"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Save Secret"}
          </Button>
        </div>
      </div>

      {/* Existing Secrets */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white px-2">Configured Secrets ({allSecrets.length})</h2>
        <div className="grid grid-cols-1 gap-3">
          {allSecrets.map((setting) => (
            <div key={setting.id} className={`group relative bg-white/5 border rounded-2xl p-4 transition-all hover:bg-white/[0.07] ${setting.isSystem ? 'border-accent-cyan/20' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRound className={`size-3 ${setting.isSystem ? 'text-accent-cyan' : 'text-accent-cyan/50'}`} />
                    <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">{setting.key}</span>
                    {setting.isSystem && (
                      <span className="text-[8px] font-black bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded border border-accent-cyan/20 tracking-tighter">SYSTEM</span>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <Input 
                      type={visibleKeys[setting.key] ? "text" : "password"}
                      value={typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)}
                      readOnly
                      className="bg-transparent border-none p-0 text-sm font-mono text-slate-300 focus-visible:ring-0 h-auto"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleVisibility(setting.key)}
                    className="size-8 rounded-lg hover:bg-white/10 text-slate-400"
                  >
                    {visibleKeys[setting.key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  {!setting.isSystem && (
                    <>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(setting.key)}
                        className="size-8 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {allSecrets.length === 0 && (
            <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/5">
              <p className="text-slate-500 italic text-sm">No secrets configured yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";

export default function CustomerSettingsPage() {
  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account security and preferences.</p>
        </header>

        {/* Account Security Card */}
        <Card className="bg-[#0c0c11] border-white/10 text-white rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-2 text-accent-cyan mb-1">
              <ShieldCheck className="size-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Account Security</span>
            </div>
            <CardTitle className="text-lg font-bold">Update Password</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>

          <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Password updated successfully!"); }}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                className="rounded-xl border-white/15 bg-black/40 text-white text-xs h-11 placeholder:text-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new secure password"
                className="rounded-xl border-white/15 bg-black/40 text-white text-xs h-11 placeholder:text-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Repeat new secure password"
                className="rounded-xl border-white/15 bg-black/40 text-white text-xs h-11 placeholder:text-white/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-accent-cyan text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="size-3.5" />
              <span>Save Changes</span>
            </Button>
          </form>
        </Card>

        {/* Preferences Section Placeholder */}
        <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-5">
          <p className="text-[11px] text-muted-foreground italic text-center">
            Notification preferences and regional settings are coming in the next platform update.
          </p>
        </div>
      </div>
    </CustomerPortalLayout>
  );
}

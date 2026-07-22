import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { prisma } from "@/database/client";
import Link from "next/link";
import {
  getGlobalSettings,
  upsertGlobalSettingAction,
  createMasterOrganizationAction,
  createMasterUserAction,
} from "@/services/developer/platform-service";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const settings = await getGlobalSettings();
  
  // Fetch all organizations in the system to bind users
  const organizations = await prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" }
  });

  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        
        {/* Alerts for action feedback */}
        {params.created_org && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle2 className="size-5 shrink-0" />
            <p className="text-sm font-semibold">Organization tenant registered successfully!</p>
          </div>
        )}
        {params.created_user && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle2 className="size-5 shrink-0" />
            <p className="text-sm font-semibold">User account registered successfully with active membership role!</p>
          </div>
        )}
        {params.error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-semibold">Error: {params.error.replace("_", " ")}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Column 1: Organizations & Settings */}
          <div className="space-y-6">
            
            {/* ADD ORGANIZATION CARD */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Add Organization</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Create a new physical or virtual print service tenant branch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createMasterOrganizationAction} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Organization Name
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g. Apex Digital, West Branch"
                      required
                      className="bg-black/40 border-white/10 text-white placeholder-muted-foreground text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Custom Tenant Slug (Optional)
                    </label>
                    <Input
                      name="slug"
                      placeholder="e.g. apex-digital"
                      className="bg-black/40 border-white/10 text-white placeholder-muted-foreground text-xs rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black font-bold text-xs rounded-full py-2.5 hover:opacity-90 transition-all duration-300">
                    CREATE ORGANISATION
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* GLOBAL SETTINGS CARD */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Platform Settings</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Raw key-value database records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form action={upsertGlobalSettingAction} className="grid gap-3">
                  <Input
                    name="key"
                    placeholder="setting.key"
                    required
                    className="bg-black/40 border-white/10 text-white text-xs rounded-xl"
                  />
                  <Input
                    name="value"
                    placeholder="JSON string or scalar value"
                    required
                    className="bg-black/40 border-white/10 text-white text-xs rounded-xl"
                  />
                  <Button type="submit" className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-full">
                    Save Key
                  </Button>
                </form>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <Link href="/developer/whatsapp">
                    <Button variant="secondary" className="w-full border-white/10 hover:bg-white/5 text-[10px] h-9 font-bold uppercase tracking-wider">
                      WhatsApp Config
                    </Button>
                  </Link>
                  <Link href="/developer/secrets">
                    <Button variant="secondary" className="w-full border-white/10 hover:bg-white/5 text-[10px] h-9 font-bold uppercase tracking-wider">
                      Manage Secrets
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Column 2: User Creation */}
          <div>
            <Card className="border-white/10 bg-white/[0.02] h-full">
              <CardHeader>
                <CardTitle className="text-white text-lg">Add User & Assign Role</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Instantly register an employee, customer, user, or administrator account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createMasterUserAction} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Full Name
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      className="bg-black/40 border-white/10 text-white placeholder-muted-foreground text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Email Address (Gmail)
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="e.g. name@gmail.com"
                      required
                      className="bg-black/40 border-white/10 text-white placeholder-muted-foreground text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Password (Minimum 8 chars)
                    </label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="bg-black/40 border-white/10 text-white placeholder-muted-foreground text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      User Type / Role
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full h-11 bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 outline-none focus:border-accent-cyan"
                    >
                      <option value="customer" className="bg-[#121218]">Customer (Orders / Prints)</option>
                      <option value="employee" className="bg-[#121218]">Employee (Operator / Printer Shop staff)</option>
                      <option value="admin" className="bg-[#121218]">Platform Administrator (System-wide)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan block">
                      Assign to Organization Branch
                    </label>
                    <select
                      name="organizationId"
                      className="w-full h-11 bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 outline-none focus:border-accent-cyan"
                    >
                      <option value="" className="bg-[#121218]">-- Auto-assigned default organization --</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-[#121218]">
                          {org.name} ({org.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black font-bold text-xs rounded-full py-2.5 hover:opacity-90 transition-all duration-300">
                    REGISTER ACCOUNT NOW
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Existing Table at bottom for platform settings records */}
        <Card className="border-white/10 bg-white/[0.01]">
          <CardHeader>
            <CardTitle className="text-white text-sm">System Database Configuration Records</CardTitle>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th className="text-accent-cyan text-xs">Key</Th>
                <Th className="text-accent-cyan text-xs">Value</Th>
                <Th className="text-accent-cyan text-xs">Updated</Th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <Td className="text-xs text-white/80 font-mono">{s.key}</Td>
                  <Td className="text-xs text-white/50 truncate max-w-xs">{JSON.stringify(s.value)}</Td>
                  <Td className="text-xs text-white/40">{s.updatedAt.toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

      </section>
    </DeveloperPortalLayout>
  );
}

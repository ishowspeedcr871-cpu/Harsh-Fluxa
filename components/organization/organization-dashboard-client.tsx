"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Printer, 
  KeyRound, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  User,
  ArrowRight
} from "lucide-react";
import { globalVerifyOtpAction } from "@/services/print-jobs/otp-service";

interface PrinterData {
  id: string;
  name: string;
  status: string;
  brand: string | null;
  connectionType: string | null;
  inkLevel: any;
}

interface OrganizationDashboardClientProps {
  organizationName: string;
  connectedPrinters: PrinterData[];
  successMessage?: string;
  errorMessage?: string;
}

export function OrganizationDashboardClient({ 
  organizationName, 
  connectedPrinters,
  successMessage,
  errorMessage
}: OrganizationDashboardClientProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const onlinePrinters = connectedPrinters.filter(p => p.status === "ONLINE");

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight"
        >
          Workstation <span className="text-accent-cyan">Active</span>
        </motion.h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
          {organizationName} • Control Center
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Printers", icon: Printer, href: "/printers", color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
          { label: "Employees", icon: User, href: "/organization/members", color: "text-accent-magenta", bg: "bg-accent-magenta/10" },
          { label: "Customers", icon: User, href: "/employee/customers", color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Orders", icon: FileText, href: "/employee/queue", color: "text-orange-400", bg: "bg-orange-400/10" },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link 
              href={action.href}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group active:scale-95"
            >
              <div className={`size-12 rounded-2xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className={`size-6 ${action.color}`} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* OTP Verification Console */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan to-accent-magenta opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-black/80 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <KeyRound className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">OTP Verification</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Release Print Job</p>
            </div>
          </div>

          <form action={async (formData) => {
            setIsVerifying(true);
            await globalVerifyOtpAction(formData);
            setIsVerifying(false);
          }} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  maxLength={4}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="4-DIGIT OTP"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-center text-4xl font-mono font-black tracking-[0.5em] text-accent-cyan focus:outline-none focus:border-accent-cyan/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                  autoFocus
                  required
                />
                {otp.length === 4 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 className="size-8 text-accent-cyan" />
                  </motion.div>
                )}
              </div>
            </div>

            <button
              disabled={otp.length !== 4 || isVerifying}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-accent-cyan to-accent-cyan/80 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
            >
              {isVerifying ? (
                <div className="size-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="size-5 fill-current" />
                  Trigger Print Command
                </>
              )}
            </button>
          </form>

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center gap-4 text-accent-cyan"
            >
              <CheckCircle2 className="size-5 flex-shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">{successMessage}</p>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400"
            >
              <AlertCircle className="size-5 flex-shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">{errorMessage}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Connected Printers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Connected Hardware</h3>
          <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
            {onlinePrinters.length} Online
          </span>
        </div>

        <div className="grid gap-4">
          {connectedPrinters.map((printer, idx) => (
            <motion.div
              key={printer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="group relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-2xl flex items-center justify-center ${
                    printer.status === 'ONLINE' 
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20' 
                      : 'bg-white/5 text-muted-foreground border border-white/10'
                  }`}>
                    <Printer className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{printer.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {printer.brand} • {printer.connectionType || 'Network'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    printer.status === 'ONLINE'
                      ? 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5'
                      : 'border-white/10 text-muted-foreground bg-white/5'
                  }`}>
                    {printer.status}
                  </span>
                  {printer.inkLevel && (
                    <div className="flex gap-0.5 h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                       <div className="flex-1 bg-white" style={{ opacity: Number((printer.inkLevel as any).black ?? 0) / 100 }} />
                       <div className="flex-1 bg-cyan-400" style={{ opacity: Number((printer.inkLevel as any).cyan ?? 0) / 100 }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {connectedPrinters.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <Printer className="size-10 mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No Printers Detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Mini-List */}
      <div className="space-y-4">
        <h3 className="px-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Prints</h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] divide-y divide-white/5">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold">Document_0{i}.pdf</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Completed • 2m ago</p>
                </div>
              </div>
              <CheckCircle2 className="size-4 text-accent-cyan/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

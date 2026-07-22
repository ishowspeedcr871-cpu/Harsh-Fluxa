"use client";

import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  LogOut, 
  Calendar,
  Award,
  Zap,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/services/auth/actions";
import { motion } from "framer-motion";

interface EmployeeProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
  membership: {
    role: {
      name: string;
    };
  };
  organization: {
    name: string;
  };
}

export function EmployeeProfileClient({
  user,
  membership,
  organization
}: EmployeeProfileClientProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px] -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="size-32 rounded-full bg-gradient-to-tr from-accent-cyan via-blue-500 to-purple-600 p-[2px] shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <div className="size-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                <User className="size-16 text-accent-cyan/80" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 size-10 rounded-full bg-accent-cyan flex items-center justify-center border-4 border-[#0a0a0f] text-black">
              <Zap className="size-5 fill-current" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {user.name || "Apex Associate"}
              </h1>
              <span className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-black uppercase tracking-widest">
                {membership.role.name}
              </span>
            </div>
            <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <Building className="size-4 text-accent-cyan" />
              {organization.name}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest font-bold">
              <Calendar className="size-3.5" />
              Joined {joinDate}
            </p>
          </div>

          <div className="md:ml-auto w-full md:w-auto">
            <form action={logoutAction}>
              <Button 
                type="submit"
                className="w-full md:px-8 h-14 rounded-2xl bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger font-black uppercase tracking-[0.15em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-danger/5"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] border border-white/5 bg-white/[0.02] p-6 space-y-6"
        >
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Mail className="size-4 text-accent-cyan" />
            Contact Details
          </h3>
          <div className="space-y-4">
            <div className="group p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-sm text-white font-semibold">{user.email}</p>
            </div>
            <div className="group p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Workspace ID</p>
              <p className="text-sm text-white font-semibold font-mono tracking-wider">#{user.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </motion.div>

        {/* Security & Access */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[24px] border border-white/5 bg-white/[0.02] p-6 space-y-6"
        >
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="size-4 text-accent-cyan" />
            Access & Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <Award className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase">Permissions Profile</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">View detailed access list</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-slate-600 group-hover:text-accent-cyan transition-colors" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Shield className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase">Security Log</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Last login 2m ago</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[24px] border border-white/5 bg-[#12121a]/60 p-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Device Persistence</p>
            <p className="text-[11px] text-slate-500 font-medium">This session is active. You will remain logged in on this device until you sign out.</p>
          </div>
          <Button variant="ghost" className="text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
            Manage All Devices
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";

type DbJob = {
  id: string;
  title: string;
  status: string;
  copies: number;
  color: boolean;
  estimatedCost: number;
  createdAt: string;
  otpCode?: string;
  shopName?: string;
};

interface CustomerHistoryListProps {
  jobs: DbJob[];
}

export function CustomerHistoryList({ jobs }: CustomerHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const s = job.status.toUpperCase();
      const isActive = !["COMPLETED", "COLLECTED", "CANCELLED", "FAILED"].includes(s);
      const isCompleted = ["COMPLETED", "COLLECTED"].includes(s);

      if (filterStatus === "active") return matchesSearch && isActive;
      if (filterStatus === "completed") return matchesSearch && isCompleted;
      return matchesSearch;
    });
  }, [jobs, searchQuery, filterStatus]);

  const formatDate = (dateStr: string) => {
    if (!mounted) return ""; // Return empty or a placeholder during SSR
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const renderOtpDigits = (otp: string) => {
    const digits = otp ? otp.replace(/\s/g, "").substring(0, 6).split("") : ["-", "-", "-", "-", "-", "-"];
    return (
      <div className="flex gap-1">
        {digits.map((digit, i) => (
          <span
            key={i}
            className="flex items-center justify-center size-7 rounded-md bg-[#140c18] border border-[#a236a5]/30 text-[#e159e6] font-mono text-[10px] font-bold"
          >
            {digit}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-white/10 bg-[#0c0c11] text-white text-sm"
          />
        </div>
        
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "all" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "active" ? "bg-accent-cyan/20 text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "completed" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-white"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-[24px] border border-white/10 bg-[#0c0c11] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Job Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-accent-cyan uppercase tracking-widest text-center">Security OTP</th>
                <th className="px-6 py-4 text-[10px] font-bold text-accent-cyan uppercase tracking-widest text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const s = job.status.toUpperCase();
                  const isCompleted = ["COMPLETED", "COLLECTED"].includes(s);
                  const isFailed = ["CANCELLED", "FAILED"].includes(s);
                  
                  return (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan">
                            <FileText className="size-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors truncate max-w-[180px]">
                              {job.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              #{job.id.substring(0, 8).toUpperCase()} • {formatDate(job.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                          ) : isFailed ? (
                            <AlertCircle className="size-3.5 text-rose-400" />
                          ) : (
                            <Clock className="size-3.5 text-amber-400 animate-pulse" />
                          )}
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${
                            isCompleted ? "text-emerald-400" : isFailed ? "text-rose-400" : "text-amber-400"
                          }`}>
                            {job.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{job.shopName || "Apex Digital"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          {renderOtpDigits(job.otpCode || "")}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-sm font-bold text-white">₹{job.estimatedCost.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">{job.copies} {job.copies > 1 ? 'copies' : 'copy'}</p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <FileText className="size-10 text-muted-foreground" />
                      <p className="text-sm font-medium text-white">No print jobs found</p>
                      <p className="text-xs text-muted-foreground">Your history will appear here once you place orders.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

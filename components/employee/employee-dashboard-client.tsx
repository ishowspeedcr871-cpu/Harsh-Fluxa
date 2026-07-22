"use client";

import { useState, useEffect } from "react";
import { UserPlus, FileSearch, Settings, Printer, Loader2 } from "lucide-react";
import { fetchLiveQueue, submitOtpAction } from "../../app/employee/actions";

export function EmployeeDashboardClient({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Real-time queue fetching (Polling every 3 seconds for simulation)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const liveJobs = await fetchLiveQueue();
        setJobs(liveJobs);
      } catch (err) {
        // Silently fail or handle error
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    setError(null);
    setSuccess(null);
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus logic
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    } else if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleRelease = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }
    
    setVerifying(true);
    setError(null);
    setSuccess(null);
    const res = await submitOtpAction(code);
    setVerifying(false);
    
    if (res.success) {
      setOtp(["", "", "", ""]);
      setSuccess(res.message || "OTP Verified successfully");
      // Fetch queue immediately
      const liveJobs = await fetchLiveQueue();
      setJobs(liveJobs);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(res.error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "COMPLETED":
      case "RELEASED":
        return "border-accent-cyan text-accent-cyan";
      case "PRINT_COMPLETED":
        return "border-green-400 text-green-400";
      case "READY":
        return "border-green-400 text-green-400";
      case "PRINTING": 
        return "border-accent-magenta text-accent-magenta animate-pulse";
      case "OTP_VERIFIED":
        return "border-accent-cyan text-accent-cyan font-black";
      case "WAITING_FOR_PRINTER":
        return "border-orange-400 text-orange-400";
      case "QUEUED":
      case "OTP_GENERATED":
        return "border-yellow-400 text-yellow-400";
      default: return "border-white/20 text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "OTP_VERIFIED": return "VERIFIED";
      case "WAITING_FOR_PRINTER": return "WAITING FOR PRINTER";
      case "PRINT_COMPLETED": return "PRINT COMPLETED";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile top header banner (desktop has its own header in layout) */}
      <div className="md:hidden border border-accent-magenta/40 rounded-xl p-4 bg-gradient-to-r from-accent-cyan/10 to-accent-magenta/10 shadow-[0_0_15px_rgba(255,0,255,0.1)]">
        <h1 className="text-base font-bold text-center text-white/90 uppercase tracking-wider">Employee Dashboard</h1>
      </div>

      {/* Main Grid Layout: Balanced multi-column on desktop/tablets, vertical stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5/12 width on desktop): Current Request Pipeline & Verify OTP */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-accent-cyan/30 rounded-2xl p-5 bg-[#0a0a0f]/60 shadow-[0_0_20px_rgba(0,255,255,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 blur-2xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-sm font-black text-white/95 uppercase tracking-wider">Current Request Pipeline</h2>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                {jobs.length} Total
              </span>
            </div>
            
            <div className="text-center mb-6 relative z-10">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Pending: <span className="text-accent-cyan font-black">{jobs.filter(j => j.status !== 'COMPLETED').length}</span> Requests
              </span>
            </div>

            {/* Pipeline visualizer */}
            <div className="relative mb-8 z-10 px-2">
              {/* Connecting Line */}
              <div className="absolute top-3 left-4 right-4 h-[2px] bg-white/10 z-0">
                <div className="absolute top-0 left-0 h-full bg-accent-cyan w-1/3" />
              </div>
              
              <div className="flex justify-between relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                  <span className="text-[9px] text-center text-white/90 leading-tight">New<br/>Submission</span>
                  <UserPlus className="size-4 text-accent-cyan mt-1" />
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                  <span className="text-[9px] text-center text-white/90 leading-tight">File Check</span>
                  <FileSearch className="size-4 text-accent-cyan mt-1" />
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-accent-magenta flex items-center justify-center relative">
                    <div className="absolute -inset-1 border-2 border-dashed border-accent-magenta rounded-full animate-spin-slow" />
                  </div>
                  <span className="text-[9px] text-center text-white/90 leading-tight">Pre-Flight</span>
                  <Settings className="size-4 text-white/40 mt-1" />
                </div>
                
                {/* Step 4 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <span className="text-[9px] text-center text-white/90 leading-tight">In<br/>Production</span>
                  <div className="w-5 h-5 rounded bg-white/10 mt-1" />
                </div>
                
                {/* Step 5 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <span className="text-[9px] text-center text-white/90 leading-tight">Quality<br/>Check</span>
                  <Printer className="size-4 text-white/40 mt-1" />
                </div>
                
                {/* Step 6 */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <span className="text-[9px] text-center text-white/90 leading-tight">Ready for<br/>Pickup</span>
                  <Printer className="size-4 text-white/40 mt-1" />
                </div>
              </div>
            </div>

            {/* Verify Pickup Box */}
            <div className="border border-white/5 rounded-xl p-4 bg-black/60 relative z-10 shadow-inner">
              <h3 className="text-xs font-black text-white/95 uppercase tracking-wider mb-1">Verify Pickup OTP</h3>
              <p className="text-[11px] text-slate-400 mb-4">Enter the 4-digit release code</p>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="flex gap-1.5 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && i > 0) {
                            const prevInput = document.getElementById(`otp-${i - 1}`);
                            prevInput?.focus();
                          }
                        }}
                        className="w-8 h-10 rounded-md bg-white/5 border border-white/10 text-center text-lg font-black text-accent-cyan focus:border-accent-cyan focus:bg-accent-cyan/5 focus:outline-none transition-all duration-200"
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleRelease}
                    disabled={verifying}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#00f0ff] hover:bg-[#00d0e0] text-black rounded-xl text-xs font-bold transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.25)] disabled:opacity-50 shrink-0"
                  >
                    {verifying ? <Loader2 className="size-4 animate-spin mx-auto" /> : "RELEASE JOB"}
                  </button>
                </div>
                {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
                {success && <p className="text-xs text-accent-cyan font-black uppercase tracking-wider">{success}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7/12 width on desktop): Awaiting Pickup Queue list */}
        <div className="lg:col-span-7">
          <div className="border border-white/10 rounded-2xl bg-[#0a0a0f]/40 p-5 md:p-6 shadow-xl">
            <h3 className="text-sm font-black text-white/95 uppercase tracking-wider mb-4">
              Awaiting Pickup Queue
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3.5 px-1 font-bold">Job ID</th>
                    <th className="pb-3.5 px-1 font-bold">Customer</th>
                    <th className="pb-3.5 px-1 font-bold">Format</th>
                    <th className="pb-3.5 px-1 font-bold">Status</th>
                    <th className="pb-3.5 px-1 font-bold text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                        No active jobs in queue
                      </td>
                    </tr>
                  ) : jobs.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-white/5 transition-all duration-150">
                      <td className="py-3.5 px-1 font-mono text-slate-400">#{item.id.slice(-4).toUpperCase()}</td>
                      <td className="py-3.5 px-1 font-bold text-white/90 group-hover:text-accent-cyan transition-colors">
                        {item.customerUser?.name || item.customerUser?.email.split('@')[0]}
                      </td>
                      <td className="py-3.5 px-1 font-bold text-slate-400">{item.files?.[0]?.fileType || "PDF"}</td>
                      <td className="py-3.5 px-1">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest border ${getStatusStyle(item.status)} bg-black/60`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-1 text-right text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

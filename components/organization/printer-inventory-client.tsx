"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer as PrinterIcon, 
  Settings2, 
  Search, 
  Filter, 
  Wifi, 
  Usb, 
  Monitor, 
  Zap, 
  AlertCircle,
  Activity,
  History,
  MoreVertical,
  CheckCircle2,
  Droplet,
  Layers,
  Database,
  Plus,
  X,
  ChevronRight
} from "lucide-react";
import { DiscoveryStatus } from "./discovery-status";
import { useRouter } from "next/navigation";
import { registerPrinterAction } from "@/services/printers/printer-service";

interface PrinterInventoryClientProps {
  initialPrinters: any[];
}

export function PrinterInventoryClient({ initialPrinters }: PrinterInventoryClientProps) {
  const [printers, setPrinters] = useState(initialPrinters);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const router = useRouter();

  // Sync state with props when server refreshes
  useEffect(() => {
    setPrinters(initialPrinters);
  }, [initialPrinters]);

  const [error, setError] = useState<string | null>(null);

  const handleDiscover = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      console.log("Starting printer discovery scan...");
      const res = await fetch("/api/organization/printers/discover", { 
        method: "POST",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      console.log("Discovery response:", data);
      
      if (data.success) {
        await new Promise(r => setTimeout(r, 1000));
        router.refresh();
      } else {
        setError(data.error || "Discovery failed");
      }
    } catch (err: any) {
      console.error("Discovery error:", err);
      if (err.name === 'AbortError') {
        setError("Printer scan timed out");
      } else {
        setError("Failed to connect to printer service");
      }
    } finally {
      setIsScanning(false);
      console.log("Discovery scan finished");
    }
  };

  const filteredPrinters = useMemo(() => {
    return printers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "ALL" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [printers, searchQuery, filter]);

  return (
    <div className="space-y-8 pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Printer <span className="text-accent-cyan">Discovery</span></h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">Universal Hardware Hub</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDiscover}
            disabled={isScanning}
            className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className={`size-4 ${isScanning ? 'text-accent-cyan animate-spin' : 'text-accent-cyan group-hover:fill-current'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isScanning ? 'Detecting...' : 'Scan Devices'}
            </span>
          </motion.button>
        </div>

        <DiscoveryStatus isScanning={isScanning} />
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        {/* Manual Add Toggle */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Manual Hardware Node</h3>
                  <button onClick={() => setIsAdding(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
                <form action={async (formData) => {
                  await registerPrinterAction(formData);
                  setIsAdding(false);
                  router.refresh();
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Device Name</label>
                      <input name="name" required placeholder="e.g. WORKSTATION-HP-01" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-accent-cyan/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Hardware Model</label>
                      <input name="model" placeholder="e.g. LaserJet Pro M404" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-accent-cyan/50 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Physical Location</label>
                      <input name="location" placeholder="e.g. SECTOR 4G" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-accent-cyan/50 transition-all" />
                    </div>
                    <div className="flex items-center gap-6 px-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isColor" defaultChecked className="size-5 rounded-lg border-white/10 bg-white/5 text-accent-cyan focus:ring-0 focus:ring-offset-0 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-accent-cyan transition-colors">Color Capability</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="supportsDuplex" defaultChecked className="size-5 rounded-lg border-white/10 bg-white/5 text-accent-cyan focus:ring-0 focus:ring-offset-0 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-accent-cyan transition-colors">Duplex Printing</span>
                      </label>
                    </div>
                  </div>
                  <button className="w-full h-16 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98]">
                    Register Device Node
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Rail */}
      <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`size-11 rounded-xl flex items-center justify-center transition-all ${isAdding ? 'bg-accent-magenta text-white rotate-45' : 'bg-accent-cyan text-black hover:scale-105'}`}
        >
          <Plus className="size-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH HARDWARE..."
            className="w-full h-11 bg-transparent pl-11 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 px-2">
          {["ALL", "ONLINE", "BUSY", "OFFLINE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3 rounded-xl text-[9px] font-black tracking-tighter transition-all ${
                filter === f ? 'bg-accent-cyan text-black' : 'bg-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Printer Grid */}
      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPrinters.map((printer, idx) => (
            <PrinterCard key={printer.id} printer={printer} index={idx} />
          ))}
        </AnimatePresence>

        {filteredPrinters.length === 0 && !isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <PrinterIcon className="size-16 mx-auto text-muted-foreground opacity-40" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-[0.2em]">No printer detected</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connect a device or run discovery</p>
            </div>
            <button 
              onClick={handleDiscover}
              className="mt-4 px-6 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider hover:bg-accent-cyan/20 transition-colors"
            >
              Refresh
            </button>
          </motion.div>
        )}
      </div>

      {/* Real-time Telemetry Legend */}
      <div className="p-6 rounded-[32px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-accent-cyan" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Universal Telemetry Feed</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter">{printers.length}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Managed Devices</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter text-accent-cyan">{printers.filter(p => p.status === 'ONLINE').length}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Network Active</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter text-accent-magenta">{printers.filter(p => p.health !== 'GOOD').length}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Health Warnings</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter">99.9%</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Node Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrinterCard({ printer, index }: { printer: any; index: number }) {
  const isOnline = printer.status === "ONLINE" || printer.status === "BUSY";
  const healthColor = printer.health === "GOOD" ? "bg-accent-cyan" : printer.health === "WARNING" ? "bg-accent-magenta" : "bg-red-500";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl transition-all hover:border-accent-cyan/30"
    >
      {/* Visual Glint Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Section */}
      <div className="flex items-start justify-between relative z-10 mb-8">
        <div className="flex gap-6">
          <div className="relative">
            <div className={`size-20 rounded-[28px] border border-white/10 bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <PrinterIcon className={`size-10 ${isOnline ? 'text-accent-cyan' : 'text-muted-foreground'} drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]`} />
            </div>
            {isOnline && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute -top-1 -right-1 size-4 rounded-full border-2 border-black ${healthColor}`} 
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black tracking-tight group-hover:text-accent-cyan transition-colors">{printer.name}</h2>
              {printer.isDefault && (
                <span className="text-[8px] font-black bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{printer.brand} • {printer.model || 'Universal'}</span>
              <span className="size-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className={`size-1.5 rounded-full ${healthColor}`} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{printer.health}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Settings2 className="size-4" />
        </button>
      </div>

      {/* Main Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
        {/* Status & Connection */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                printer.status === 'ONLINE' ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan' :
                printer.status === 'BUSY' ? 'border-accent-magenta/40 bg-accent-magenta/5 text-accent-magenta' :
                'border-white/10 bg-white/5 text-muted-foreground'
              }`}>
                {printer.status}
              </div>
              {printer.status === 'BUSY' && (
                <span className="text-[10px] font-bold text-accent-magenta animate-pulse">Printing...</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Connection</p>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                {printer.connectionType === 'USB' ? <Usb className="size-3 text-orange-400" /> : <Wifi className="size-3 text-accent-cyan" />}
              </div>
              <span className="text-[10px] font-black tracking-tighter">{printer.connectionType} • {printer.ipAddress || 'Internal'}</span>
            </div>
          </div>
        </div>

        {/* Ink / Consumables */}
        <div className="space-y-3">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Consumables</p>
          <div className="flex gap-2">
            {printer.inkLevel && Object.entries(printer.inkLevel).map(([color, level]: [string, any]) => (
              <div key={color} className="flex flex-col items-center gap-1.5">
                <div className="w-2.5 h-12 bg-white/5 rounded-full relative overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${level}%` }}
                    className={`absolute bottom-0 left-0 right-0 ${
                      color === 'black' ? 'bg-white' : 
                      color === 'cyan' ? 'bg-cyan-400' :
                      color === 'magenta' ? 'bg-magenta-400' : 'bg-yellow-400'
                    }`}
                  />
                </div>
                <span className="text-[8px] font-black uppercase opacity-60">{color[0]}</span>
              </div>
            ))}
            {!printer.inkLevel && printer.tonerLevel && (
               <div className="flex items-center gap-3">
                  <Droplet className="size-4 text-accent-cyan" />
                  <div className="flex-1 h-2 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-accent-cyan" style={{ width: `${printer.tonerLevel.black}%` }} />
                  </div>
                  <span className="text-[10px] font-black">{printer.tonerLevel.black}%</span>
               </div>
            )}
          </div>
        </div>

        {/* Paper & Load */}
        <div className="space-y-3">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Paper Trays</p>
          <div className="space-y-2">
            {printer.paperLevels && Object.entries(printer.paperLevels).map(([tray, level]: [string, any]) => (
              <div key={tray} className="flex items-center gap-3">
                <Layers className="size-3 text-muted-foreground" />
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-accent-cyan ${level < 20 ? 'bg-accent-magenta animate-pulse' : ''}`} style={{ width: `${level}%` }} />
                </div>
                <span className="text-[9px] font-bold">{level}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Driver */}
        <div className="space-y-3">
           <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
            <p className="text-xs font-black">{printer.location || 'Unknown Sector'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Driver Version</p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">{printer.driver || 'Generic-V1'}</p>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="size-3 text-accent-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Queue: <span className="text-white">{printer.queueLength || 0} JOBS</span></span>
          </div>
          <div className="flex items-center gap-2">
            <History className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Last seen: <span className="text-white">Just now</span></span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
             View Queue
           </button>
           <button className="h-10 px-6 rounded-xl bg-accent-cyan text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-cyan/20">
             Print Test
           </button>
        </div>
      </div>
    </motion.div>
  );
}

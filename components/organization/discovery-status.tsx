"use client";

import { motion } from "framer-motion";
import { Search, Monitor, Wifi, Usb, Globe, Cpu } from "lucide-react";

const methods = [
  { name: "CONNECTOR", icon: Cpu, color: "text-accent-magenta" },
  { name: "SPOOLER", icon: Monitor, color: "text-blue-400" },
  { name: "CUPS", icon: Cpu, color: "text-purple-400" },
  { name: "mDNS", icon: Wifi, color: "text-green-400" },
  { name: "USB", icon: Usb, color: "text-orange-400" },
  { name: "SNMP", icon: Globe, color: "text-accent-cyan" },
];

export function DiscoveryStatus({ isScanning }: { isScanning: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className={`size-4 text-accent-cyan ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning && (
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-accent-cyan/50 rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {isScanning ? 'Scanning Universal Connector...' : 'Connector Standby'}
          </span>
        </div>
        <div className="flex gap-1.5">
          {methods.map((m) => (
            <motion.div
              key={m.name}
              animate={isScanning ? { opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] } : { opacity: 0.3 }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5`}
              title={m.name}
            >
              <m.icon className={`size-2.5 ${m.color}`} />
              <span className="text-[7px] font-black">{m.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {isScanning && (
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
          />
        </div>
      )}
    </div>
  );
}

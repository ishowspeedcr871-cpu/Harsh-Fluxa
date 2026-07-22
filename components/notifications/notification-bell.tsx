"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Inbox, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { markAsRead, markAllAsRead, listNotifications } from "@/services/notifications/notification-service";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  portalType?: "customer" | "employee" | "developer";
}

export function NotificationBell({ portalType = "customer" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await listNotifications({ page: 1, pageSize: 10, status: "UNREAD", type: "all", q: "" });
      setNotifications(res.notifications);
      setUnreadCount(res.unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(notifications.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications([]);
    setUnreadCount(0);
  };

  const historyPath = portalType === "customer" ? "/customer/notifications" : portalType === "employee" ? "/employee/notifications" : "/developer/notifications";

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={cn(
          "relative flex items-center justify-center size-9 md:size-10 rounded-full border transition-all duration-300",
          isOpen 
            ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]" 
            : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
        )}
      >
        <Bell className="size-4 md:size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-accent-magenta animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            ref={popoverRef}
            className="absolute right-0 mt-3 w-[300px] md:w-[360px] max-h-[480px] overflow-hidden bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl shadow-black z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xs font-black text-white tracking-wider uppercase">Notifications</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                  {unreadCount} UNREAD MESSAGES
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[9px] font-black text-accent-cyan hover:text-white transition-colors uppercase tracking-widest bg-accent-cyan/10 px-3 py-1 rounded-full border border-accent-cyan/20"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-none py-2 px-2 min-h-[100px]">
              {isLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="size-6 text-accent-cyan animate-spin" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fetching data...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="group relative p-3 rounded-2xl bg-white/0 hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0 size-8 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                          <Inbox className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-wide truncate">
                              {notification.title}
                            </h4>
                            <span className="text-[8px] font-bold text-slate-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="flex items-center gap-1.5 text-[8px] font-black text-accent-cyan uppercase tracking-widest bg-accent-cyan/10 hover:bg-accent-cyan/20 px-2 py-1 rounded-lg transition-all"
                            >
                              <Check className="size-2.5" />
                              Mark Read
                            </button>
                            {notification.entityId && (
                              <Link
                                href={notification.entityType === 'PrintJob' ? `/${portalType === 'customer' ? 'customer' : 'employee'}/jobs/${notification.entityId}` : '#'}
                                className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                                onClick={() => setIsOpen(false)}
                              >
                                <ExternalLink className="size-2.5" />
                                View
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                    <Bell className="size-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">All caught up!</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">No new notifications to show.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <Link
                href={historyPath}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all"
              >
                View History
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

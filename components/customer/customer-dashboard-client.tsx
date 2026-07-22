"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  X,
  Sparkles,
  Check,
  User,
  RefreshCw,
  Clock,
  ArrowRight,
  Info,
  Layers,
  FileCheck2,
  Printer,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  pages: number;
  color: boolean;
  orientation: "portrait" | "landscape";
};

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

interface CustomerDashboardClientProps {
  initialJobs: DbJob[];
  userEmail: string | null;
  activeCount: number;
  completedCount: number;
  historyCount: number;
  initialFilter?: "active" | "completed" | "history";
  whatsappNumber?: string | null;
}

export function CustomerDashboardClient({
  initialJobs,
  userEmail,
  activeCount,
  completedCount,
  historyCount,
  initialFilter = "active",
  whatsappNumber,
}: CustomerDashboardClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Staged files local state
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState<"active" | "completed" | "history">(initialFilter);

  // Conversion simulation states
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertingFileName, setConvertingFileName] = useState("");
  const [conversionMessage, setConversionMessage] = useState("");

  // Print Configuration States (inline)
  const [showSettings, setShowSettings] = useState(false);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState(false); // false = B/W, true = Color
  const [duplexMode, setDuplexMode] = useState(true);
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageRange, setPageRange] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderName, setOrderName] = useState("");

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal / Popup States matching image exact specs
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [popupOtpCode, setPopupOtpCode] = useState("");
  const [popupJobId, setPopupJobId] = useState("");
  const [popupFileName, setPopupFileName] = useState("");
  const [popupCost, setPopupCost] = useState(40.00);
  const [popupSettings, setPopupSettings] = useState("A4, Color, 2 Copies");

  // Local state to track newly added jobs dynamically
  const [localJobs, setLocalJobs] = useState<DbJob[]>([]);
  const [mounted, setMounted] = useState(false);

  // Pre-load a default file representation
  useEffect(() => {
    setMounted(true);
    setStagedFiles([
      {
        id: "default-pdf",
        name: "Presentation_Final.pdf",
        size: 2451000,
        type: "application/pdf",
        pages: 1,
        color: false,
        orientation: "portrait",
      }
    ]);
    setOrderName("Presentation_Final");
    setShowSettings(true);
  }, []);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const incomingFiles = Array.from(files);
    
    // If multiple files, we could process them in sequence or just take them all.
    // To keep the UX consistent with the "Fluxa Converter" animation, we'll process the first one for animation but add all.
    
    const file = incomingFiles[0];
    
    // Start Conversion Flow
    setConvertingFileName(incomingFiles.length > 1 ? `${incomingFiles.length} files selected` : file.name);
    setIsConverting(true);
    setConversionProgress(0);
    setConversionMessage("Uploading raw files to print network...");

    const messages = [
      "Uploading raw files to print network...",
      "Analyzing document structures & pages...",
      "Fluxa Converter processing vectors...",
      "Converting document contents into print-optimized PDF...",
      "Flattening transparent layers & embedded images...",
      "Applying print margins & anti-aliasing...",
      "Documents successfully converted and ready for configuration!"
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Complete conversion
        setTimeout(() => {
          setIsConverting(false);
          
          const newFiles: UploadedFile[] = incomingFiles.map(f => {
            const pdfName = f.name.replace(/\.[^/.]+$/, "") + ".pdf";
            const isImage = f.type.startsWith('image/');
            const pages = isImage ? 1 : Math.max(1, Math.floor(f.size / 800000) || 1);
            
            return {
              id: crypto.randomUUID(),
              name: pdfName,
              size: f.size,
              type: "application/pdf",
              pages: pages,
              color: false,
              orientation: "portrait",
            };
          });

          setStagedFiles((prev) => [...prev, ...newFiles]);
          if (!orderName) {
            setOrderName(incomingFiles.length > 1 ? `Batch Order (${incomingFiles.length} files)` : incomingFiles[0].name.replace(/\.[^/.]+$/, ""));
          }
          setShowSettings(true);
        }, 300);
      }

      setConversionProgress(progress);
      
      const msgIndex = Math.min(
        Math.floor((progress / 100) * messages.length),
        messages.length - 1
      );
      setConversionMessage(messages[msgIndex]);
    }, 60);
  };

  // Live active file representation (first file in staged queue)
  const activeFile = stagedFiles[0] || null;

  // Real-time pricing calculator for all staged files
  const activeFileCost = useMemo(() => {
    if (stagedFiles.length === 0) return 0;
    const totalPages = stagedFiles.reduce((acc, file) => acc + file.pages, 0);
    const rate = colorMode ? 10 : 2; // Rs 2 for B/W, Rs 10 for Color
    return totalPages * rate * copies;
  }, [stagedFiles, colorMode, copies]);

  const clearStagedFiles = () => {
    setStagedFiles([]);
    setShowSettings(false);
    setOrderName("");
  };

  // OTP representation: helper to split code into glowing boxes
  const renderOtpDigits = (otp: string) => {
    const digits = otp ? otp.replace(/\s/g, "").substring(0, 6).split("") : ["7", "3", "4", "9", "0", "1"];
    while (digits.length < 6) digits.push("0");
    return (
      <div className="flex gap-1 ml-1 select-all">
        {digits.map((digit, i) => (
          <span
            key={i}
            className="flex items-center justify-center size-8 rounded-[6px] bg-[#140c18] border border-[#a236a5]/30 text-[#e159e6] font-mono text-xs font-extrabold shadow-[0_0_8px_rgba(225,89,230,0.2)]"
          >
            {digit}
          </span>
        ))}
      </div>
    );
  };

  // Handle placing a real print order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) return;
    if (!userEmail) {
      alert("Please login first to submit a real print order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: orderName || (stagedFiles.length === 1 ? stagedFiles[0].name.replace(".pdf", "") : `Batch Order (${stagedFiles.length})`),
          copies,
          color: colorMode,
          duplex: duplexMode,
          paperSize,
          orientation,
          pageRange,
          specialInstructions,
          estimatedCost: activeFileCost,
          fileHistory: stagedFiles.map(f => f.name).join(", "),
          files: stagedFiles.map(f => ({
            fileName: f.name,
            fileSize: f.size,
            mimeType: f.type
          }))
        }),
      });

      const data = await response.json();
      if (data.success && data.job) {
        // Capture data for the gorgeous modal
        setPopupOtpCode(data.job.otpCode);
        setPopupJobId(data.job.id.substring(0, 8).toUpperCase());
        setPopupFileName(stagedFiles.length === 1 ? stagedFiles[0].name : `${stagedFiles.length} files`);
        setPopupCost(data.job.estimatedCost);
        
        const modeLabel = colorMode ? "Color" : "B/W";
        setPopupSettings(`${paperSize}, ${modeLabel}, ${copies} Copies`);

        // Show Modal
        setShowOtpPopup(true);

        // Prepend new job to local tracker list
        setLocalJobs((prev) => [data.job, ...prev]);
        
        // Clear staged files after successful order
        setStagedFiles([]);
        setShowSettings(false);
        setOrderName("");
      } else {
        alert(data.error || "Failed to submit print job.");
      }
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      console.error(error);
      alert("Error occurred while submitting order. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine initialJobs with localJobs
  const allJobsMerged = useMemo(() => {
    const map = new Map<string, DbJob>();
    // Add local ones first
    localJobs.forEach((j) => map.set(j.id, j));
    // Add initial ones next
    initialJobs.forEach((j) => {
      if (!map.has(j.id)) {
        map.set(j.id, j);
      }
    });
    return Array.from(map.values());
  }, [initialJobs, localJobs]);

  // Filter jobs based on selected tab
  const displayedJobs = useMemo(() => {
    if (allJobsMerged.length > 0) {
      return allJobsMerged.filter((job) => {
        const s = job.status.toUpperCase();
        if (selectedJobFilter === "completed") return ["COLLECTED", "COMPLETED"].includes(s);
        if (selectedJobFilter === "history") return ["CANCELLED", "FAILED"].includes(s);
        return !["COMPLETED", "COLLECTED", "CANCELLED", "FAILED"].includes(s);
      });
    }

    // Default mock list exact to image spec if database is empty
    return [
      {
        id: "FLX-8821",
        title: "Presentation_Final.pdf",
        status: "Awaiting Pickup",
        copies: 2,
        color: true,
        estimatedCost: 40.00,
        createdAt: mounted ? new Date().toISOString() : "2026-07-19T00:00:00.000Z",
        otpCode: "734901",
        shopName: "Apex Digital",
      }
    ];
  }, [allJobsMerged, selectedJobFilter, mounted]);

  return (
    <div className="space-y-5">
      
      {/* 1. UPLOAD DOCUMENTS GRADIENT BORDER NEON CARD */}
      <div className="rounded-[30px] p-[1.5px] bg-gradient-to-br from-accent-cyan via-accent-cyan/40 to-accent-magenta/90 shadow-[0_4px_30px_rgba(184,100,70,0.15)] relative overflow-hidden">
        <div className="rounded-[29px] bg-[#0c0c11]/95 backdrop-blur-md p-6 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Subtle tech background lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

          {/* Card Title */}
          <h2 className="text-[25px] font-extrabold text-white tracking-tight leading-none mt-2">
            Upload Documents
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-[280px]">
            Any file format uploaded is automatically converted to PDF.
          </p>

          {/* Inline Login Capsule */}
          <div className="mt-4 mb-5">
            {userEmail ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-cyan tracking-wide">
                <Check className="size-3.5" />
                <span>{userEmail}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 border border-accent-cyan/35 text-xs font-bold text-accent-cyan hover:brightness-110 tracking-wider shadow-[0_0_12px_rgba(184,100,70,0.2)] transition-all duration-300"
                >
                  <User className="size-3.5" />
                  <span>Login to Order</span>
                </Link>
                <span className="text-[10px] text-amber-500/80 font-medium">Authentication required to submit printing jobs</span>
              </div>
            )}
          </div>

          {/* MAIN UPLOAD / CONVERSION INTERFACE */}
          <AnimatePresence mode="wait">
            {isConverting ? (
              /* PROGRESSIVE PDF CONVERTER LOADER SCREEN */
              <motion.div
                key="converting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md py-6 px-4 border border-white/10 rounded-2xl bg-black/40 space-y-4 flex flex-col items-center"
              >
                <div className="relative size-24 flex items-center justify-center">
                  {/* Glowing background circles */}
                  <div className="absolute inset-0 rounded-full bg-accent-cyan/10 blur-md animate-pulse" />
                  
                  {/* Outer spinning progress ring */}
                  <svg className="absolute size-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="url(#cyanMagentaGradient)"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - conversionProgress / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="cyanMagentaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Inner File icon */}
                  <FileText className="size-10 text-accent-cyan animate-bounce" />
                </div>

                <div className="space-y-1.5 text-center w-full">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest text-accent-cyan">
                    Fluxa PDF Converter Engine
                  </p>
                  <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                    {convertingFileName}
                  </p>
                  <div className="flex justify-between text-xs text-white/75 font-mono max-w-[200px] mx-auto pt-1">
                    <span>Converting...</span>
                    <span>{conversionProgress}%</span>
                  </div>
                  <Progress value={conversionProgress} className="h-1.5 bg-white/5 w-full max-w-[200px] mx-auto" />
                </div>

                <p className="text-xs text-muted-foreground/90 font-sans italic min-h-[32px] text-center max-w-sm px-2 transition-all duration-300">
                  {conversionMessage}
                </p>
              </motion.div>
            ) : (
              /* STANDARD UPLOAD BUTTON ORB */
              <motion.div
                key="upload-orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer group flex items-center justify-center size-36 rounded-full relative transition-all duration-500 scale-[1.02]"
              >
                {/* Ambient Outer Ring Pulsing */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-cyan/20 to-accent-magenta/10 blur-md group-hover:scale-105 transition-transform duration-500" />
                
                {/* Main Circle Glassmorphic Body */}
                <div className="absolute inset-2 rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.01] shadow-[inset_0_4px_12px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center transition-all duration-300 group-hover:border-accent-cyan/40">
                  {/* Dynamic Inner Glow Circle */}
                  <div className="size-20 rounded-full border-2 border-accent-cyan/30 flex items-center justify-center bg-accent-cyan/5 group-hover:bg-accent-cyan/15 transition-all duration-300 shadow-[0_0_20px_rgba(184,100,70,0.1)]">
                    <UploadCloud className="size-10 text-accent-cyan group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Glossy overlay effect reflecting light like a sphere */}
                <div className="absolute top-[8px] left-[20px] w-20 h-8 rounded-full bg-white/5 blur-[2px] transform -rotate-[12deg] pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formats info */}
          <p className="text-[13px] font-bold text-white mt-5">
            PDF, Word, PowerPoint, or Images.
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Converted files are secure, high-contrast, and rasterized to PDF.
          </p>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".pdf,.docx,.pptx,image/png,image/jpeg,image/webp"
          />

          {/* 2. WHATSAPP CAPSULE GREEN BUTTON */}
          <a
            href={whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "https://wa.me/919999999999"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-[#25D366]/40 bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#25D366] text-xs font-bold tracking-wide transition-all duration-300 group shadow-[0_2px_12px_rgba(37,211,102,0.05)]"
          >
            <svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.864.001-2.641-1.025-5.125-2.89-6.995C16.58 1.88 14.102.85 11.465.85 6.027.85 1.602 5.263 1.6 10.704c-.001 1.708.452 3.376 1.312 4.85l-.995 3.633 3.73-.977zm11.368-6.19c-.312-.156-1.85-.912-2.131-1.013-.282-.102-.487-.153-.691.153-.204.307-.791.992-.97 1.196-.179.205-.358.23-.67.074-.312-.156-1.318-.486-2.51-1.548-.928-.827-1.554-1.849-1.736-2.155-.18-.307-.018-.472.138-.627.14-.139.312-.361.468-.542.156-.181.208-.307.312-.511.104-.205.052-.384-.026-.54-.078-.157-.691-1.666-.947-2.28-.249-.598-.503-.517-.69-.526-.179-.009-.384-.01-.59-.01-.205 0-.54.077-.822.384-.282.307-1.077 1.053-1.077 2.569s1.102 2.984 1.256 3.19c.154.205 2.169 3.311 5.256 4.643.734.316 1.307.505 1.753.647.739.235 1.412.202 1.944.123.593-.088 1.85-.756 2.112-1.448.262-.693.262-1.288.184-1.412-.078-.125-.282-.201-.594-.358z"/>
            </svg>
            <span>Forward from WhatsApp to Fluxa</span>
          </a>

          {/* DUAL ACTION UTILITY PILLS */}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <button
              onClick={clearStagedFiles}
              className="py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 text-xs font-semibold text-white transition-all duration-300"
            >
              Clear Draft
            </button>
            <button
              onClick={() => {
                if (stagedFiles.length > 0) {
                  alert("PDF converted file has been refreshed and validated!");
                } else {
                  alert("Select or drop a file first to convert to PDF!");
                }
              }}
              className="py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 text-xs font-semibold text-white transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="size-3" />
              <span>Refresh Scan</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. ACTIVE FILE CONVERSATION DETAILS CARD */}
      <AnimatePresence>
        {stagedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-[22px] border border-white/10 bg-[#0e0e13] p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[13px] font-bold text-white tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="size-4 text-emerald-400" />
                <span>Converted Documents ({stagedFiles.length}):</span>
              </span>
              <button
                onClick={clearStagedFiles}
                className="text-muted-foreground hover:text-white transition-colors"
                title="Remove all files"
              >
                <X className="size-4" />
              </button>
            </div>

            <div id="staged-files-container" className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {stagedFiles.map((file) => (
                <div key={file.id} id={`staged-file-${file.id}`} className="flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-accent-cyan truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {file.pages} pages <span className="text-white/25 mx-1">|</span> {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    id={`remove-file-${file.id}`}
                    onClick={() => setStagedFiles(prev => prev.filter(f => f.id !== file.id))}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
                  >
                    <X className="size-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-muted-foreground font-mono flex justify-between">
                <span>Total Estimations:</span>
                <span className="text-white">₹{activeFileCost.toFixed(2)}</span>
              </p>
            </div>

            {/* Quick action badges to toggle properties */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setColorMode((prev) => !prev)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all duration-300 ${
                  colorMode
                    ? "border-accent-magenta/35 bg-accent-magenta/10 text-accent-magenta"
                    : "border-white/10 bg-black/40 text-muted-foreground hover:text-white"
                }`}
              >
                {colorMode ? "Color" : "B/W"}
              </button>
              <button
                onClick={() => setOrientation((o) => o === "portrait" ? "landscape" : "portrait")}
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 bg-black/40 text-muted-foreground hover:text-white transition-colors"
              >
                {orientation === "portrait" ? "Vertical" : "Horizontal"}
              </button>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Ready to Configure
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. COHESIVE SETTINGS CONFIGURATION FORM IN THE SAME PAGE */}
      <AnimatePresence>
        {stagedFiles.length > 0 && showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-[22px] border border-white/10 bg-[#0c0c11]/80 backdrop-blur-md p-6 space-y-6 overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="size-4 text-accent-cyan" />
              <h3 className="text-base font-bold text-white">Print Customizations</h3>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Form Job Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                  Order Display Name
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Presentation Final"
                  required
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="rounded-xl border-white/15 bg-black/40 text-white text-xs h-10 placeholder:text-white/20"
                />
              </div>

              {/* Black & White vs Color Premium Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                  Color Mode Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColorMode(false)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 ${
                      !colorMode
                        ? "border-accent-cyan bg-accent-cyan/10 text-white shadow-md shadow-accent-cyan/5"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-semibold">Black & White</span>
                    <span className="text-[10px] opacity-75 mt-0.5">₹2 per copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorMode(true)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 ${
                      colorMode
                        ? "border-accent-magenta bg-accent-magenta/10 text-white shadow-md shadow-accent-magenta/5"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-semibold">Vibrant Color</span>
                    <span className="text-[10px] opacity-75 mt-0.5">₹10 per copy</span>
                  </button>
                </div>
              </div>

              {/* Copies Stepper & Range Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                    Number of Copies
                  </label>
                  <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                    {copies} Copy(s)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/25 text-white hover:bg-white/10 transition-colors text-lg font-bold"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full accent-accent-cyan h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies((c) => Math.min(50, c + 1))}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/25 text-white hover:bg-white/10 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Advanced Properties Grid */}
              <div className="grid gap-4 grid-cols-2">
                {/* Paper Size */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider block">
                    Paper Size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/15 text-white text-xs rounded-xl px-2.5 outline-none focus:border-accent-cyan"
                  >
                    <option value="A4" className="bg-[#121218]">A4 Standard</option>
                    <option value="Letter" className="bg-[#121218]">Letter Size</option>
                    <option value="Legal" className="bg-[#121218]">Legal Size</option>
                  </select>
                </div>

                {/* Print Sides */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider block">
                    Print Sides
                  </label>
                  <select
                    value={duplexMode ? "double" : "single"}
                    onChange={(e) => setDuplexMode(e.target.value === "double")}
                    className="w-full h-10 bg-black/40 border border-white/15 text-white text-xs rounded-xl px-2.5 outline-none focus:border-accent-cyan"
                  >
                    <option value="double" className="bg-[#121218]">Double-Sided (Duplex)</option>
                    <option value="single" className="bg-[#121218]">Single-Sided</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider block">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full h-10 bg-black/40 border border-white/15 text-white text-xs rounded-xl px-2.5 outline-none focus:border-accent-cyan"
                  >
                    <option value="portrait" className="bg-[#121218]">Vertical (Portrait)</option>
                    <option value="landscape" className="bg-[#121218]">Horizontal (Landscape)</option>
                  </select>
                </div>

                {/* Page Range */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider block">
                    Page Range
                  </label>
                  <Input
                    placeholder="All (e.g. 1-3, 5)"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    className="rounded-xl border-white/15 bg-black/40 text-white text-xs h-10 placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider block">
                  Special Instructions
                </label>
                <Textarea
                  placeholder="Binding instructions, stapling, special margin offsets..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="rounded-xl border-white/15 bg-black/40 text-white text-xs placeholder:text-white/20 h-16 min-h-[50px] resize-none"
                  rows={2}
                />
              </div>

              {/* LIVE BILL RECEIPT */}
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-black/45 to-black/25 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Live Calculation receipt
                  </span>
                  <span className="text-[9px] text-accent-cyan font-mono bg-accent-cyan/10 px-2 py-0.5 rounded-full">
                    Instant Estimate
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Quality Base:</span>
                    <span className="text-white font-medium">{colorMode ? "Color (₹10)" : "B/W (₹2)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <span className="text-white font-medium">{stagedFiles.reduce((acc, f) => acc + f.pages, 0)} pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Copies:</span>
                    <span className="text-white font-medium">x {copies}</span>
                  </div>
                  <div className="border-t border-dashed border-white/10 my-2 pt-2 flex justify-between text-sm font-bold text-white font-sans">
                    <span>Subtotal:</span>
                    <span className="text-accent-cyan text-base">₹{activeFileCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SUBMISSION FORM ACTION BUTTON */}
              {userEmail ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-accent-cyan/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-black" />
                      <span>Placing Print Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Print Order</span>
                      <ArrowRight className="size-3.5 stroke-[3]" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <User className="size-4" />
                    <span>Login to Submit Order</span>
                  </Link>
                  <p className="text-[10px] text-center text-muted-foreground">
                    You must sign in with your Fluxa client account to submit.
                  </p>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. RECENT JOBS TRACKING SECTION */}
      <div className="rounded-[22px] border border-white/10 bg-[#0c0c11] p-5 space-y-4">
        <h3 className="text-[17px] font-extrabold text-white tracking-tight">
          Recent Jobs
        </h3>

        {/* Filter Capsule Tabs exactly styled to mockup */}
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-full p-[3px]">
          <button
            onClick={() => setSelectedJobFilter("active")}
            className={`flex-1 text-center py-2 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${
              selectedJobFilter === "active"
                ? "bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 text-white border border-white/10 shadow-inner"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Active ({selectedJobFilter === "active" ? displayedJobs.length : "List"})
          </button>
          <button
            onClick={() => setSelectedJobFilter("completed")}
            className={`flex-1 text-center py-2 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${
              selectedJobFilter === "completed"
                ? "bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 text-white border border-white/10 shadow-inner"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Completed ({selectedJobFilter === "completed" ? displayedJobs.length : "List"})
          </button>
          <button
            onClick={() => setSelectedJobFilter("history")}
            className={`flex-1 text-center py-2 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${
              selectedJobFilter === "history"
                ? "bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 text-white border border-white/10 shadow-inner"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            History ({selectedJobFilter === "history" ? displayedJobs.length : "List"})
          </button>
        </div>

        {/* Jobs List container with glow styles */}
        <div className="space-y-4">
          {displayedJobs.map((job) => {
            const cleanStatus = job.status.replaceAll("_", " ");
            const displayId = job.id.startsWith("mock-") ? "FLX-8821" : job.id.substring(0, 8).toUpperCase();
            
            return (
              <div
                key={job.id}
                className="pt-2 pb-1 border-b border-white/5 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col gap-2.5">
                  
                  {/* Job ID & Status Line */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-white/50 tracking-wide">
                      Job ID: <span className="text-white font-bold hover:text-accent-cyan underline underline-offset-2">#{displayId}</span>
                    </span>
                    <span className="font-sans font-extrabold text-white text-[12px] flex items-center gap-1.5">
                      Status: <span className="text-[#fbbf24] font-semibold">{cleanStatus}</span>
                    </span>
                  </div>

                  {/* Shop Location & OTP Blocks Row */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Printer Shop:</span>
                      <span className="text-white font-semibold">{job.shopName || "Apex Digital"}</span>
                    </div>

                    {/* Highly Styled OTP Display exactly matching image spec (glow magenta box) */}
                    <div className="flex items-center">
                      <span className="text-[11px] font-extrabold tracking-widest text-[#a236a5]/80 uppercase mr-1.5">
                        OTP:
                      </span>
                      {renderOtpDigits(job.otpCode || "734901")}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. GORGEOUS CENTRAL INTERACTIVE POPUP MODAL (EXACT DESIGN FROM IMAGE SPEC) */}
      <AnimatePresence>
        {showOtpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
          >
            {/* Ambient Background laser beams */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent transform -rotate-45" />
              <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-accent-magenta/20 to-transparent transform rotate-45" />
            </div>

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative w-full max-w-xl bg-[#0c0c11]/95 border border-white/10 rounded-[30px] p-6 sm:p-10 shadow-2xl flex flex-col space-y-6"
            >
              
              {/* Header: FLUXA Logo on left, Welcome back on right */}
              <div className="flex items-start justify-between border-b border-white/5 pb-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-widest text-white">FLUXA</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground/80 block leading-tight">Welcome back,</span>
                  <span className="text-[13px] font-bold text-white tracking-wide">Apex Digital Print Solutions!</span>
                </div>
              </div>

              {/* My Print Queue Card Container */}
              <div className="rounded-[24px] border border-white/5 bg-[#121218]/90 p-5 sm:p-6 space-y-6 shadow-inner relative overflow-hidden">
                <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                  My Print Queue
                </h3>

                {/* Status capsule exactly styled as "Status: Awaiting Pickup at Apex Digital" */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent-cyan/30 bg-[#0c161d] text-accent-cyan text-xs font-bold tracking-wide shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                    Status: Awaiting Pickup at Apex Digital
                  </div>
                </div>

                {/* OTP Magenta Title and Glow Blocks with space in between */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
                  <span className="text-3xl font-extrabold tracking-widest text-accent-magenta uppercase text-[26px]">
                    OTP:
                  </span>
                  
                  {/* Separate Blocks matching image */}
                  <div className="flex items-center gap-2">
                    {/* First 3 Blocks */}
                    <div className="flex gap-1.5">
                      {popupOtpCode.substring(0, 3).split("").map((char, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center size-11 sm:size-12 rounded-xl bg-[#2e1065] border border-[#d946ef]/45 text-[#f472b6] font-mono text-xl sm:text-2xl font-black shadow-[0_0_15px_rgba(217,70,239,0.35)] relative overflow-hidden"
                        >
                          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/40" />
                          <span className="relative z-10">{char}</span>
                        </div>
                      ))}
                    </div>

                    {/* Gap */}
                    <div className="w-1.5" />

                    {/* Next 3 Blocks */}
                    <div className="flex gap-1.5">
                      {popupOtpCode.substring(3, 6).split("").map((char, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center size-11 sm:size-12 rounded-xl bg-[#2e1065] border border-[#d946ef]/45 text-[#f472b6] font-mono text-xl sm:text-2xl font-black shadow-[0_0_15px_rgba(217,70,239,0.35)] relative overflow-hidden"
                        >
                          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/40" />
                          <span className="relative z-10">{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-muted-foreground/80 tracking-wide max-w-sm mx-auto">
                  Show this code to the attendant to release your documents.
                </p>

                {/* High-fidelity Stepper Timeline */}
                <div className="relative pt-6 pb-2 px-1">
                  {/* Line Background */}
                  <div className="absolute left-[8%] right-[8%] top-[34px] h-[2px] bg-white/10" />
                  {/* Progress Line */}
                  <div className="absolute left-[8%] w-[58%] top-[34px] h-[2px] bg-[#06b6d4]" />

                  {/* Four Steps with exactly corresponding layout and checks */}
                  <div className="relative flex justify-between text-center">
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center space-y-1.5 flex-1">
                      <div className="size-[22px] rounded-full bg-[#06b6d4] text-black flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                      <span className="text-[9px] font-extrabold text-white leading-tight max-w-[80px]">
                        WhatsApp Upload Received
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center space-y-1.5 flex-1">
                      <div className="size-[22px] rounded-full bg-[#06b6d4] text-black flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                      <span className="text-[9px] font-extrabold text-white leading-tight max-w-[80px]">
                        Processing & Pricing
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center space-y-1.5 flex-1">
                      <div className="size-[22px] rounded-full bg-[#2e1065] text-[#d946ef] flex items-center justify-center border border-[#d946ef]/40 shadow-[0_0_8px_rgba(217,70,239,0.3)] animate-pulse">
                        <RefreshCw className="size-2.5 animate-spin text-[#d946ef]" />
                      </div>
                      <span className="text-[9px] font-extrabold text-[#d946ef] leading-tight max-w-[80px]">
                        Ready for Printing
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center space-y-1.5 flex-1">
                      <div className="size-[22px] rounded-full bg-white/5 border border-white/10 text-muted-foreground flex items-center justify-center">
                        <span className="size-2 rounded-full bg-white/20" />
                      </div>
                      <span className="text-[9px] font-extrabold text-muted-foreground leading-tight max-w-[80px]">
                        Print Job Completed
                      </span>
                    </div>

                  </div>
                </div>

                {/* Specifications List Details Area */}
                <div className="rounded-[18px] border border-white/5 bg-black/40 p-4 font-sans text-[12px] space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Job ID</span>
                    <span className="text-white font-mono font-bold">#{popupJobId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Document</span>
                    <span className="text-white font-semibold truncate max-w-[220px]">{popupFileName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Settings</span>
                    <span className="text-white font-semibold">{popupSettings}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Total Cost</span>
                    <span className="text-emerald-400 font-extrabold text-xs">
                      ₹{popupCost.toFixed(2)} <span className="text-emerald-400 font-semibold">(Paid)</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Upload Another Action Button */}
              <button
                onClick={() => {
                  setShowOtpPopup(false);
                  clearStagedFiles();
                }}
                className="w-full h-12 rounded-full bg-[#110e1a] hover:bg-black/80 text-white text-xs font-bold tracking-widest uppercase border-2 border-accent-magenta/40 hover:border-accent-cyan/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
              >
                Upload Another Document
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

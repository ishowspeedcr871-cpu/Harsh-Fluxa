"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, X, HelpCircle, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { estimateUploadCost, paperSizes } from "@/features/customer/upload-schemas";

type UploadQueueItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "ready" | "validating" | "accepted" | "rejected";
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CustomerUploadWorkspace({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState(false);
  const [duplex, setDuplex] = useState(true);
  const [paperSize, setPaperSize] = useState<string>("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageRange, setPageRange] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [title, setTitle] = useState("");

  const rate = color ? 10 : 2;
  const subtotal = copies * rate;

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file) => {
      const isDocx = file.name.endsWith(".docx");
      const isPptx = file.name.endsWith(".pptx");
      const accepted = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ].includes(file.type) || isDocx || isPptx;

      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        progress: accepted ? 100 : 0,
        status: accepted ? "accepted" : "rejected",
      } satisfies UploadQueueItem;
    });

    // Automatically set form title based on first accepted file if not already set
    const firstAccepted = next.find((item) => item.status === "accepted");
    if (firstAccepted && !title) {
      const cleanName = firstAccepted.name.replace(/\.[^/.]+$/, ""); // strip extension
      setTitle(cleanName.substring(0, 50));
    }

    setQueue((current) => [...next, ...current].slice(0, 12));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] animate-fade-in">
      {/* LEFT: File Upload Panel */}
      <div className="space-y-6">
        <Card className="overflow-hidden border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <UploadCloud className="size-5 text-accent-cyan" />
              <span>1. Upload Documents</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Drag your digital documents here to stage them securely for high-speed cloud printing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
              className="group cursor-pointer rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-accent-cyan/50 bg-gradient-to-br from-white/[0.02] to-white/[0.01] hover:from-accent-cyan/5 hover:to-accent-magenta/5 p-10 text-center transition-all duration-500"
            >
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/[0.03] text-accent-cyan group-hover:bg-accent-cyan/15 group-hover:scale-110 transition-all duration-300">
                <UploadCloud className="size-7" />
              </div>
              <p className="text-base font-semibold text-white group-hover:text-accent-cyan transition-colors">
                Click to browse or drag document here
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Supports PDF, DOCX, PPTX and high-res Images
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => addFiles(event.target.files)}
                accept=".pdf,.docx,.pptx,image/png,image/jpeg,image/webp"
              />
            </motion.div>

            {/* Uploaded Queue */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Staged Files ({queue.filter((f) => f.status === "accepted").length})
              </h3>
              <AnimatePresence initial={false}>
                {queue.length ? (
                  queue.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 p-4 transition-all hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-accent-magenta">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(file.size)} · {file.type.split("/")[1]?.toUpperCase() || "DOC"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setQueue((items) => items.filter((item) => item.id !== file.id))
                          }
                          className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      {file.status === "accepted" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-success mb-1">
                            <span className="flex items-center gap-1">
                              <Check className="size-3" /> Document validated
                            </span>
                            <span>100%</span>
                          </div>
                          <Progress value={100} className="h-1 bg-white/5" />
                        </div>
                      )}

                      {file.status === "rejected" && (
                        <p className="mt-2 text-xs text-danger">
                          Unsupported file type. Use PDF, DOCX, PPTX or standard images.
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center">
                    <FileText className="mx-auto size-8 text-white/10 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No files loaded yet. Select a document to start configuring print settings.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Print Configuration & Live Price Card */}
      <div className="space-y-6">
        <Card className="border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="size-5 text-accent-magenta" />
              <span>2. Print Settings</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Customize the formatting and quality constraints for physical printing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                try {
                  // Ensure form values are synced
                  formData.set("title", title);
                  formData.set("copies", String(copies));
                  formData.set("color", color ? "on" : "off");
                  formData.set("duplex", duplex ? "on" : "off");
                  formData.set("paperSize", paperSize);
                  formData.set("orientation", orientation);
                  formData.set("pageRange", pageRange);
                  formData.set("specialInstructions", specialInstructions);
                  formData.set("estimatedCost", String(subtotal));
                  formData.set("fileHistory", queue.map((f) => f.name).join(", "));
                  await createAction(formData);
                } catch (error: any) {
                  if (error.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                    return;
                  }
                  console.error("Order creation error:", error);
                  alert("Failed to place order. Please try again.");
                }
              }}
              className="space-y-5"
            >
              {/* Form Job Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Name
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Project Proposal Draft"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border-white/15 bg-black/25 text-white"
                />
              </div>

              {/* Black & White vs Color Premium Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColor(false)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                      !color
                        ? "border-accent-cyan bg-accent-cyan/10 text-white shadow-md shadow-accent-cyan/5"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-semibold">Black & White</span>
                    <span className="text-[10px] opacity-80 mt-1">₹2 per copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColor(true)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                      color
                        ? "border-accent-magenta bg-accent-magenta/10 text-white shadow-md shadow-accent-magenta/5"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-semibold">Vibrant Color</span>
                    <span className="text-[10px] opacity-80 mt-1">₹10 per copy</span>
                  </button>
                </div>
              </div>

              {/* Copies Slider / Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Number of Copies
                  </label>
                  <span className="text-sm font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                    {copies}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-white hover:bg-white/10 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full accent-accent-cyan h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies((c) => Math.min(100, c + 1))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-white hover:bg-white/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Secondary Options Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Paper Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Paper Size
                  </label>
                  <Select
                    name="paperSize"
                    value={paperSize}
                    onChange={(event) => setPaperSize(event.target.value)}
                    className="rounded-2xl border-white/15 bg-black/25 text-white"
                  >
                    {paperSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Print Sides */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Print Sides
                  </label>
                  <Select
                    name="duplex"
                    value={duplex ? "double" : "single"}
                    onChange={(event) => setDuplex(event.target.value === "double")}
                    className="rounded-2xl border-white/15 bg-black/25 text-white"
                  >
                    <option value="single">Single Sided</option>
                    <option value="double">Double Sided (Duplex)</option>
                  </Select>
                </div>

                {/* Orientation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Orientation
                  </label>
                  <Select
                    name="orientation"
                    value={orientation}
                    onChange={(event) => setOrientation(event.target.value as "portrait" | "landscape")}
                    className="rounded-2xl border-white/15 bg-black/25 text-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </Select>
                </div>

                {/* Page Range */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Page Range
                  </label>
                  <Input
                    name="pageRange"
                    placeholder="All (e.g. 1-5, 8)"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    className="rounded-2xl border-white/15 bg-black/25 text-white text-sm"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Special Instructions
                </label>
                <Textarea
                  name="specialInstructions"
                  placeholder="Binding requests, pickup preferences or cover sheet details..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="rounded-2xl border-white/15 bg-black/25 text-white text-sm"
                  rows={2}
                />
              </div>

              {/* LIVE PRICING RECEIPT CARD */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 space-y-4">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles className="size-24 text-accent-cyan" />
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estimated Bill
                  </span>
                  <span className="text-xs text-accent-cyan font-mono bg-accent-cyan/10 px-2 py-0.5 rounded-full">
                    Live Calculation
                  </span>
                </div>

                {/* Clear Pricing Summary Structure */}
                <div className="space-y-2.5 font-mono text-sm text-muted-foreground">
                  <div className="flex justify-between items-center text-white font-sans font-semibold">
                    <span>Print Quality Mode</span>
                    <span>{color ? "Color Printing" : "Black & White"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Copies:</span>
                    <span className="text-white font-semibold">{copies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="text-white font-semibold">₹{rate}/copy</span>
                  </div>
                  <div className="border-t border-dashed border-white/10 my-2 pt-2 flex justify-between text-base font-bold text-white font-sans">
                    <span>Subtotal:</span>
                    <span className="text-accent-cyan text-lg">₹{subtotal}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Pricing is calculated on a fixed-consumer scale of ₹2 per black & white sheet and ₹10 per high-resolution color page. All taxes included.
                  </p>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <Button
                type="submit"
                disabled={queue.filter((f) => f.status === "accepted").length === 0}
                className="w-full h-14 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-black text-base font-bold hover:opacity-90 shadow-lg shadow-accent-cyan/10 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Place Print Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

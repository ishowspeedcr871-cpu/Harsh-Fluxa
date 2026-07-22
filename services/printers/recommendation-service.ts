import { prisma } from "@/database/client";
import { Printer, PrintJob, PrinterStatus } from "@prisma/client";

interface RecommendationCriteria {
  color?: boolean;
  paperSize?: string;
  maxCost?: number;
  priority?: "SPEED" | "COST" | "QUALITY";
}

export async function recommendBestPrinter(organizationId: string, criteria: RecommendationCriteria) {
  const printers = await prisma.printer.findMany({
    where: {
      organizationId,
      status: { not: PrinterStatus.OFFLINE },
      deletedAt: null
    },
    include: {
      _count: {
        select: { jobs: { where: { status: { in: ["QUEUED", "PRINTING"] } } } }
      }
    }
  });

  if (printers.length === 0) return null;

  const scoredPrinters = printers.map(printer => {
    let score = 100;

    // Filter by color requirement
    if (criteria.color && !printer.isColor) score -= 1000;
    
    // Filter by paper size
    if (criteria.paperSize && printer.maxPageSize !== criteria.paperSize) {
       // Check if printer supports it (if we had a list, for now basic match)
       if (printer.maxPageSize === "A4" && criteria.paperSize === "A3") score -= 1000;
    }

    // Health penalties
    if (printer.health === "WARNING") score -= 20;
    if (printer.health === "CRITICAL") score -= 80;

    // Status penalties
    if (printer.status === "BUSY") score -= 15;
    
    // Load balancing (Queue length)
    score -= (printer.queueLength || 0) * 5;

    // Connection quality
    if (printer.connectionType === "ETHERNET") score += 10;
    if (printer.connectionType === "USB") score += 5;
    if (printer.connectionType === "CLOUD") score -= 5;

    return { printer, score };
  });

  // Sort by score descending
  return scoredPrinters.sort((a, b) => b.score - a.score)[0]?.printer || null;
}

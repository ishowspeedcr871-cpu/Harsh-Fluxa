import { createHash, randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { homedir, hostname } from "node:os";
import { printLocalFile } from "./print-engine.js";
import { discoverWindowsPrinters } from "./windows-printers.js";

type ConnectorFile = { id: string; name: string; mimeType: string; size: number; checksumSha256?: string | null; downloadUrl: string };
type ConnectorJob = { id: string; files: ConnectorFile[]; printer: { windowsPrinterId: string | null } | null };

const apiUrl = required("FLUXA_API_URL").replace(/\/$/, "");
const apiKey = required("FLUXA_API_KEY");
const connectorId = process.env.FLUXA_CONNECTOR_ID || `${hostname()}-${createHash("sha256").update(homedir()).digest("hex").slice(0, 12)}`;
const pollIntervalMs = Math.max(5_000, Number(process.env.FLUXA_POLL_INTERVAL_MS || 15_000));
const workDir = process.env.FLUXA_WORK_DIR || join(process.env.PROGRAMDATA || join(homedir(), ".fluxa"), "Fluxa", "jobs");

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`CONFIGURATION_REQUIRED: ${name} must be set.`);
  return value;
}

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { "x-api-key": apiKey, "content-type": "application/json", ...init.headers } });
  if (!response.ok) throw new Error(`CONNECTOR_API_ERROR: ${response.status} ${await response.text()}`);
  return response;
}

async function report(jobId: string, status: "PRINT_COMPLETED" | "FAILED", note: string) {
  await request(`/api/v1/connector/jobs/${jobId}/status`, { method: "POST", body: JSON.stringify({ connectorId, status, note }) });
}

function safeFileName(name: string) {
  return basename(name).replace(/[^a-zA-Z0-9._-]/g, "_") || "print-file";
}

async function download(file: ConnectorFile) {
  const response = await request(file.downloadUrl, { headers: { "x-api-key": apiKey, "x-fluxa-connector-id": connectorId } });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== file.size) throw new Error("FILE_VALIDATION_FAILED: Download response size mismatch.");
  const checksum = createHash("sha256").update(bytes).digest("hex");
  if (file.checksumSha256 && checksum !== file.checksumSha256) throw new Error("FILE_VALIDATION_FAILED: Download response checksum mismatch.");
  const headerChecksum = response.headers.get("x-fluxa-checksum-sha256");
  if (headerChecksum && headerChecksum !== checksum) throw new Error("FILE_VALIDATION_FAILED: Server checksum header mismatch.");
  const path = join(workDir, `${randomUUID()}-${safeFileName(file.name)}`);
  await writeFile(path, bytes, { flag: "wx" });
  return path;
}

async function processJob(job: ConnectorJob) {
  if (!job.printer?.windowsPrinterId) throw new Error("PRINTER_NOT_FOUND: Job has no live Windows printer identity.");
  for (const file of job.files) {
    let path: string | undefined;
    try {
      path = await download(file);
      await printLocalFile({ localPath: path, mimeType: file.mimeType, expectedSize: file.size, checksumSha256: file.checksumSha256, windowsPrinterId: job.printer.windowsPrinterId });
    } finally {
      if (path) await rm(path, { force: true });
    }
  }
}

async function heartbeat() {
  const livePrinters = await discoverWindowsPrinters();
  const response = await request("/api/v1/connector/heartbeat", {
    method: "POST",
    body: JSON.stringify({ connectorId, macAddress: connectorId, status: "ONLINE", health: "GOOD", livePrinters }),
  });
  return (await response.json()).jobs as ConnectorJob[];
}

async function run() {
  if (process.platform !== "win32") throw new Error("WINDOWS_REQUIRED: Fluxa Desktop Connector must run on Windows.");
  await mkdir(workDir, { recursive: true });
  for (;;) {
    try {
      for (const job of await heartbeat()) {
        let claimed = false;
        try {
          const claim = await request(`/api/v1/connector/jobs/${job.id}/claim`, { method: "POST", body: JSON.stringify({ connectorId }) });
          claimed = (await claim.json()).claimed === true;
          if (!claimed) continue;
          await processJob(job);
          await report(job.id, "PRINT_COMPLETED", "Connector validated downloaded bytes and the Windows print command completed successfully.");
        } catch (error) {
          if (claimed) await report(job.id, "FAILED", error instanceof Error ? error.message : "Connector print failure.");
          else console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

void run().catch((error) => { console.error(error); process.exitCode = 1; });

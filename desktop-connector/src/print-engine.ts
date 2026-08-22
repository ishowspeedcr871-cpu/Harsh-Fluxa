import { createHash } from "node:crypto";
import { stat, readFile } from "node:fs/promises";
import { extname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { assertWindowsPrinterAvailable } from "./windows-printers.js";

const execFileAsync = promisify(execFile);
const supportedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export type PrintFileInput = {
  localPath: string;
  mimeType: string;
  expectedSize: number;
  checksumSha256?: string | null;
  windowsPrinterId: string;
};

function assertMagicBytes(input: { mimeType: string; bytes: Buffer }) {
  const { mimeType, bytes } = input;
  if (mimeType === "application/pdf" && bytes.subarray(0, 4).toString() !== "%PDF") throw new Error("FILE_VALIDATION_FAILED: Invalid PDF signature.");
  if (mimeType === "image/png" && !bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) throw new Error("FILE_VALIDATION_FAILED: Invalid PNG signature.");
  if (mimeType === "image/jpeg" && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) throw new Error("FILE_VALIDATION_FAILED: Invalid JPEG signature.");
  if (mimeType === "image/webp" && !(bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP")) throw new Error("FILE_VALIDATION_FAILED: Invalid WEBP signature.");
}

export async function validateDownloadedFile(input: Omit<PrintFileInput, "windowsPrinterId">) {
  if (!supportedMimeTypes.has(input.mimeType)) throw new Error("UNSUPPORTED_FILE_TYPE: Connector cannot safely print this file type.");
  const fileStat = await stat(input.localPath);
  if (fileStat.size <= 0) throw new Error("FILE_VALIDATION_FAILED: Downloaded file is empty.");
  if (fileStat.size !== input.expectedSize) throw new Error("FILE_VALIDATION_FAILED: Downloaded file size mismatch.");
  const bytes = await readFile(input.localPath);
  const checksum = createHash("sha256").update(bytes).digest("hex");
  if (input.checksumSha256 && checksum !== input.checksumSha256) throw new Error("FILE_VALIDATION_FAILED: Downloaded file checksum mismatch.");
  assertMagicBytes({ mimeType: input.mimeType, bytes });
  return { size: fileStat.size, checksumSha256: checksum };
}

export async function printLocalFile(input: PrintFileInput) {
  if (process.platform !== "win32") throw new Error("WINDOWS_REQUIRED: Printing requires Windows Desktop Connector runtime.");
  const printer = await assertWindowsPrinterAvailable(input.windowsPrinterId);
  const validation = await validateDownloadedFile(input);
  const extension = extname(input.localPath).toLowerCase();

  if (![".pdf", ".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    throw new Error("UNSUPPORTED_FILE_TYPE: File extension is not supported by the connector print engine.");
  }

  await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Start-Process -FilePath '${input.localPath.replaceAll("'", "''")}' -Verb PrintTo -ArgumentList '${printer.name.replaceAll("'", "''")}' -PassThru | Wait-Process -Timeout 60`,
  ], { timeout: 75000, windowsHide: true });

  return { printer, validation, handedToWindowsSpooler: true };
}

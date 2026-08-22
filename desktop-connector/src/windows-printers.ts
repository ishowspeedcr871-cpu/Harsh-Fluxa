import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type WindowsPrinter = {
  id: string;
  name: string;
  driver?: string;
  portName?: string;
  isDefault: boolean;
  status: "ONLINE" | "BUSY";
  health: "GOOD" | "WARNING" | "CRITICAL";
  supportsColor?: boolean;
  supportsDuplex?: boolean;
};

function powershellArgs(command: string) {
  return ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command];
}

function stablePrinterId(printer: any) {
  const primary = printer.DeviceID || printer.Name;
  return String(primary).trim().toLowerCase();
}

function isUsableWindowsPrinter(printer: any) {
  if (!printer || printer.WorkOffline || !printer.Name) return false;
  if (printer.PrinterStatus && [7, 9].includes(Number(printer.PrinterStatus))) return false;
  return true;
}

export async function discoverWindowsPrinters(): Promise<WindowsPrinter[]> {
  if (process.platform !== "win32") {
    throw new Error("WINDOWS_REQUIRED: Real printer discovery requires Windows Desktop Connector runtime.");
  }

  const command = `Get-CimInstance Win32_Printer | Select-Object Name,DeviceID,DriverName,PortName,Default,WorkOffline,PrinterStatus,DetectedErrorState,Queued,ExtendedPrinterStatus,CapabilityDescriptions | ConvertTo-Json -Depth 4`;
  const { stdout } = await execFileAsync("powershell.exe", powershellArgs(command), { timeout: 15000, windowsHide: true, maxBuffer: 1024 * 1024 });
  const parsed = stdout.trim() ? JSON.parse(stdout) : [];
  const printers = Array.isArray(parsed) ? parsed : [parsed];

  return printers.filter(isUsableWindowsPrinter).map((printer: any) => ({
    id: stablePrinterId(printer),
    name: String(printer.Name),
    driver: printer.DriverName ? String(printer.DriverName) : undefined,
    portName: printer.PortName ? String(printer.PortName) : undefined,
    isDefault: Boolean(printer.Default),
    status: Number(printer.Queued || 0) > 0 ? "BUSY" : "ONLINE",
    health: printer.DetectedErrorState ? "WARNING" : "GOOD",
    supportsColor: Array.isArray(printer.CapabilityDescriptions) ? printer.CapabilityDescriptions.some((c: string) => /color/i.test(c)) : undefined,
    supportsDuplex: Array.isArray(printer.CapabilityDescriptions) ? printer.CapabilityDescriptions.some((c: string) => /duplex|two-sided/i.test(c)) : undefined,
  }));
}

export async function assertWindowsPrinterAvailable(windowsPrinterId: string) {
  const printers = await discoverWindowsPrinters();
  const printer = printers.find((candidate) => candidate.id === windowsPrinterId);
  if (!printer) throw new Error("PRINTER_NOT_FOUND: Selected Windows printer is not currently available.");
  return printer;
}

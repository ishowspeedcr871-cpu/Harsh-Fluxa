/**
 * Reusable utility to deep-serialize Prisma query results or any other data
 * before passing them from Server Components/Server Actions to Client Components.
 * 
 * It converts:
 * - Prisma.Decimal -> number
 * - BigInt -> string
 * - Date -> ISO string
 * - Set -> array
 * - Map -> plain object
 */
export function serializeData<T>(data: T): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle BigInt
  if (typeof data === "bigint") {
    return data.toString();
  }

  // Handle Set
  if (data instanceof Set) {
    return Array.from(data).map(item => serializeData(item));
  }

  // Handle Map
  if (data instanceof Map) {
    const obj: Record<string, any> = {};
    for (const [key, val] of data.entries()) {
      obj[String(key)] = serializeData(val);
    }
    return obj;
  }

  // Handle Array
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item));
  }

  // Handle Object
  if (typeof data === "object") {
    // Check if it's a Prisma.Decimal or custom Decimal object
    const constructorName = (data as any).constructor?.name;
    if (
      constructorName === "Decimal" ||
      (typeof (data as any).toFixed === "function" && typeof (data as any).toNumber === "function") ||
      ("s" in data && "e" in data && "d" in data && Array.isArray((data as any).d))
    ) {
      return (data as any).toNumber?.() ?? Number(data);
    }

    // Recursively serialize plain objects
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      result[key] = serializeData((data as any)[key]);
    }
    return result;
  }

  return data;
}

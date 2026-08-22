import { createHash } from "node:crypto";
import { Readable } from "node:stream";

const DEFAULT_BUCKET = "fluxa_uploads";

type StoredFile = {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksumSha256: string;
};

let clientPromise: Promise<any> | null = null;

async function mongodb() {
  try {
    return await (new Function("specifier", "return import(specifier)"))("mongodb");
  } catch {
    throw new Error("STORAGE_FAILED: MongoDB driver is required for GridFS uploads.");
  }
}

function mongoUri() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) throw new Error("STORAGE_FAILED: MONGODB_URI is not configured.");
  return uri;
}

function databaseName() {
  return process.env.MONGODB_DB || process.env.MONGO_DB || "fluxa";
}

function bucketName() {
  return process.env.GRIDFS_BUCKET || DEFAULT_BUCKET;
}

async function getMongoClient() {
  const { MongoClient } = await mongodb();
  clientPromise ??= MongoClient.connect(mongoUri());
  return clientPromise;
}

export async function getGridFSBucket() {
  const { GridFSBucket } = await mongodb();
  const client = await getMongoClient();
  return new GridFSBucket(client.db(databaseName()), { bucketName: bucketName() });
}

async function parseStorageKey(storageKey: string) {
  const { ObjectId } = await mongodb();
  const [scheme, db, bucket, id] = storageKey.split(":");
  if (scheme !== "gridfs" || !db || !bucket || !ObjectId.isValid(id)) {
    throw new Error("FILE_REFERENCE_INVALID: Invalid GridFS storage key.");
  }
  return { db, bucket, id: new ObjectId(id) };
}

export async function storeUploadedFile(file: File): Promise<StoredFile> {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length !== file.size) throw new Error("FILE_VALIDATION_FAILED: Uploaded byte count mismatch.");

  const checksumSha256 = createHash("sha256").update(bytes).digest("hex");
  const bucket = await getGridFSBucket();
  const upload = bucket.openUploadStream(file.name, {
    contentType: file.type || "application/octet-stream",
    metadata: { checksumSha256, originalSize: bytes.length },
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(bytes).pipe(upload).on("error", reject).on("finish", () => resolve());
  });

  return {
    storageKey: `gridfs:${databaseName()}:${bucketName()}:${upload.id.toString()}`,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: bytes.length,
    checksumSha256,
  };
}

export async function readStoredFile(storageKey: string) {
  const { GridFSBucket } = await mongodb();
  const parsed = await parseStorageKey(storageKey);
  const client = await getMongoClient();
  const bucket = new GridFSBucket(client.db(parsed.db), { bucketName: parsed.bucket });
  const files = await bucket.find({ _id: parsed.id }).toArray();
  const file = files[0];
  if (!file) throw new Error("FILE_NOT_FOUND: GridFS object not found.");
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    bucket.openDownloadStream(parsed.id)
      .on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
      .on("error", reject)
      .on("end", resolve);
  });
  const body = Buffer.concat(chunks);
  return { body, contentType: file.contentType || "application/octet-stream", fileName: file.filename, size: body.length };
}

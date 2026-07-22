import { z } from "zod";
import { authErrorCode, authErrorStatus, isAuthError } from "@/services/auth/errors";
import { serializeOcrError } from "@/services/ocr/errors";

export async function readOcrJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new z.ZodError([
      { code: z.ZodIssueCode.custom, path: [], message: "Request body must be valid JSON." },
    ]);
  }
}

export function handleOcrApiError(error: unknown) {
  if (isAuthError(error)) {
    return Response.json(
      {
        error: {
          code: authErrorCode(error),
          message: error instanceof Error ? error.message : "Forbidden",
        },
      },
      { status: authErrorStatus(error) },
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid OCR request input.",
          issues: error.issues,
        },
      },
      { status: 422 },
    );
  }
  return serializeOcrError(error);
}

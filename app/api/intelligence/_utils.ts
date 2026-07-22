import { z } from "zod";
import { authErrorCode, authErrorStatus, isAuthError } from "@/services/auth/errors";
import { serializeIntelligenceError } from "@/services/intelligence/errors";

export async function readIntelligenceJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new z.ZodError([
      { code: z.ZodIssueCode.custom, path: [], message: "Request body must be valid JSON." },
    ]);
  }
}

export function handleIntelligenceApiError(error: unknown) {
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
          message: "Invalid intelligence input.",
          issues: error.issues,
        },
      },
      { status: 422 },
    );
  }
  return serializeIntelligenceError(error);
}

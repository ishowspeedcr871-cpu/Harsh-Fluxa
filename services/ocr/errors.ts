export class OcrServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function serializeOcrError(error: unknown) {
  if (error instanceof OcrServiceError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  return Response.json(
    {
      error: {
        code: "OCR_INTERNAL_ERROR",
        message: "The OCR platform request could not be completed.",
      },
    },
    { status: 500 },
  );
}

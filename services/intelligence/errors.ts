export class IntelligenceServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function serializeIntelligenceError(error: unknown) {
  if (error instanceof IntelligenceServiceError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  return Response.json(
    {
      error: {
        code: "INTELLIGENCE_INTERNAL_ERROR",
        message: "The intelligence request could not be completed.",
      },
    },
    { status: 500 },
  );
}

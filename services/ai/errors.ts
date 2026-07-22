export class AiServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function serializeAiError(error: unknown) {
  if (error instanceof AiServiceError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  return Response.json(
    {
      error: {
        code: "AI_INTERNAL_ERROR",
        message: "The AI platform request could not be completed.",
      },
    },
    { status: 500 },
  );
}

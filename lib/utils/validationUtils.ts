import { ZodSchema } from "zod";

// Utility function to validate Zod schemas
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors
      .map((e) => e.message)
      .join(", ");
    throw new Error(errorMessage);
  }

  return validationResult.data;
}

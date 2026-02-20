import { z, type ZodSchema } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Validate input against a Zod schema. Returns typed data or error message. */
export function validateInput<T>(
  schema: ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Invalid input",
    };
  }
  return { success: true, data: result.data };
}

/** Common Zod schemas reusable across apps */
export const schemas = {
  email: z.string().email().max(255).trim().toLowerCase(),

  safeUrl: z
    .string()
    .url()
    .max(2048)
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "Only HTTP and HTTPS URLs are allowed" },
    ),

  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  textInput: z.string().min(1).max(10000).trim(),
  shortText: z.string().min(1).max(200).trim(),
  uuid: z.string().uuid(),
};

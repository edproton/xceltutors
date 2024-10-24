import { z } from "zod";

export const emailSchema = z.object({
  to: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

export type EmailFormData = z.infer<typeof emailSchema>;

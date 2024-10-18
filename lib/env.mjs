import { z } from "zod";
import { LOG_CATEGORY_CONFIGURATION } from "./constants/logCategories.mjs";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    `❌ ${LOG_CATEGORY_CONFIGURATION} Environment variable validation failed:`,
    parsedEnv.error.format()
  );
  throw new Error(
    `❌ ${LOG_CATEGORY_CONFIGURATION} Fatal error: Missing or invalid environment variables for "${process.env.NODE_ENV}". Please check the .env file and ensure all required variables are correctly set.`
  );
} else {
  console.log(
    `✅ ${LOG_CATEGORY_CONFIGURATION} Environment variables loaded successfully. Running in "${parsedEnv.data.NODE_ENV}" mode.`
  );
}

export const env = parsedEnv.data;

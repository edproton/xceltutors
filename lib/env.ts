export interface Env {
  NEXT_PUBLIC_API_URL: string;
  NODE_ENV: "development" | "production" | "test";
  DATABASE_URL: string;
  EMAIL_PORT: number;
  EMAIL_HOST: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM_NAME: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
}

export const env = process.env as unknown as Env;

console.log(
  `✅ [CONFIGURATION] Environment variables loaded. Running in "${env.NODE_ENV}" mode.`
);

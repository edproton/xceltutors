import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { Transporter, SendMailOptions } from "nodemailer";
import { SmtpServerInfo } from "./types";

interface EmailError extends Error {
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
}

interface SendEmailOptions {
  subject: string;
  text: string;
  to: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const SMTP_CONFIG = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  maxRetries: 3,
  baseRetryDelay: 1000,
} as const;

export async function getSmtpServerInfo(): Promise<SmtpServerInfo> {
  return {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: false,
  };
}

export async function pingSmtp(): Promise<{
  success: boolean;
  message: string;
}> {
  const transporter = createTransporter();

  try {
    await transporter.verify();
    return {
      success: true,
      message: "SMTP server is reachable",
    };
  } catch (error) {
    const emailError = error as EmailError;
    const errorDetails = {
      code: emailError.code,
      message: emailError.message,
      timestamp: new Date().toISOString(),
    };

    console.error("SMTP ping failed:", errorDetails);

    return {
      success: false,
      message: getErrorMessage(emailError),
    };
  } finally {
    transporter.close();
  }
}

const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
    connectionTimeout: SMTP_CONFIG.connectionTimeout,
    greetingTimeout: SMTP_CONFIG.greetingTimeout,
    socketTimeout: SMTP_CONFIG.socketTimeout,
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    requireTLS: true,
  });
};

async function attemptSendEmail(
  transporter: Transporter,
  mailOptions: SendMailOptions
): Promise<EmailResult> {
  try {
    await transporter.verify();
    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    const emailError = error as EmailError;
    throw emailError;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendEmail({
  subject,
  text,
  to,
  html,
}: SendEmailOptions): Promise<EmailResult> {
  const transporter = createTransporter();
  let lastError: EmailError | null = null;

  const mailOptions: SendMailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "high",
    },
  };

  try {
    for (let attempt = 0; attempt < SMTP_CONFIG.maxRetries; attempt++) {
      try {
        const result = await attemptSendEmail(transporter, mailOptions);
        if (result.success) {
          return result;
        }
      } catch (error) {
        lastError = error as EmailError;

        // Don't retry for authentication errors
        if (lastError.code === "EAUTH") {
          break;
        }

        // If this isn't the last attempt, wait before retrying
        if (attempt < SMTP_CONFIG.maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = SMTP_CONFIG.baseRetryDelay * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }

    // If we get here, all attempts failed
    const errorDetails = {
      code: lastError?.code,
      message: lastError?.message,
      timestamp: new Date().toISOString(),
      recipient: to,
      subject,
      attempts: SMTP_CONFIG.maxRetries,
    };

    console.error("Email sending failed after all attempts:", errorDetails);

    return {
      success: false,
      error: getErrorMessage(lastError!),
    };
  } finally {
    transporter.close();
  }
}

export async function sendConfirmationEmail(
  to: string,
  confirmationToken: string
): Promise<EmailResult> {
  const confirmationUrl = `${env.NEXT_PUBLIC_API_URL}/auth/confirm/${confirmationToken}`;

  return sendEmail({
    subject: "Welcome to XcelTutors - Please Confirm Your Email",
    text: getConfirmationEmailText(confirmationUrl),
    html: getConfirmationEmailHtml(confirmationUrl),
    to,
  });
}

function getErrorMessage(error: EmailError): string {
  switch (error.code) {
    case "ECONNECTION":
    case "ETIMEDOUT":
      return "Unable to connect to email server. Please try again later.";
    case "EAUTH":
      return "Email authentication failed. Please contact support.";
    default:
      return "An error occurred while sending the email. Please try again later.";
  }
}

function getConfirmationEmailText(confirmationUrl: string): string {
  return `Welcome to XcelTutors! We're excited to have you on board. Please confirm your email by clicking on the following link: ${confirmationUrl}`;
}

function getConfirmationEmailHtml(confirmationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to XcelTutors</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="background-color: #4a90e2; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Welcome to XcelTutors!</h1>
        </header>
        <main style="padding: 20px;">
            <p style="font-size: 16px;">Dear New Member,</p>
            <p style="font-size: 16px;">We're thrilled to have you join the XcelTutors community! You're just one step away from unlocking a world of learning opportunities.</p>
            <p style="font-size: 16px;">To get started, please confirm your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">Confirm My Email</a>
            </div>
            <p style="font-size: 16px;">Once confirmed, you'll have full access to our platform, where you can:</p>
            <ul style="font-size: 16px;">
                <li>Connect with expert tutors</li>
                <li>Access tailored learning resources</li>
                <li>Track your progress and achievements</li>
            </ul>
            <p style="font-size: 16px;">If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
            <p style="font-size: 16px;">We're looking forward to being part of your learning journey!</p>
        </main>
        <footer style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px;">
            <p>&copy; 2024 XcelTutors. All rights reserved.</p>
            <p>If you didn't create an account with us, please disregard this email.</p>
        </footer>
    </body>
    </html>`;
}

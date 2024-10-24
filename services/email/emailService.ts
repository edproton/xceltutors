import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { Transporter, TransportOptions, SendMailOptions } from "nodemailer";
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

const HOST = "smtp.zoho.eu";
const PORT = 465;
export async function getSmtpServerInfo(): Promise<SmtpServerInfo> {
  // Simply return the hardcoded configuration
  return {
    host: HOST,
    port: PORT,
    secure: true, // Since port is 465, this is typically true for SSL
  };
}

export async function pingSmtp(): Promise<{
  success: boolean;
  message: string;
}> {
  const transporter = createTransporter();

  try {
    // Attempt to verify the connection configuration
    await transporter.verify();

    return {
      success: true,
      message: "SMTP server is reachable and properly configured",
    };
  } catch (error) {
    const emailError = error as EmailError;

    console.error("SMTP ping failed:", {
      error: emailError.message,
      code: emailError.code,
      command: emailError.command,
      response: emailError.response,
      responseCode: emailError.responseCode,
      timestamp: new Date().toISOString(),
    });

    // Return specific error messages based on the error type
    if (emailError.code === "ECONNECTION" || emailError.code === "ETIMEDOUT") {
      return {
        success: false,
        message:
          "Unable to connect to SMTP server: Connection failed or timed out",
      };
    }

    if (emailError.code === "EAUTH") {
      return {
        success: false,
        message: "SMTP authentication failed: Invalid credentials",
      };
    }

    // Generic error message for other cases
    return {
      success: false,
      message: `SMTP server check failed: ${emailError.message}`,
    };
  } finally {
    transporter.close();
  }
}

// Create reusable transporter with better configuration
const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: true, // Enable debug logging
    logger: true, // Enable logging
    tls: {
      rejectUnauthorized: true,
      timeout: 10000,
      servername: HOST,
    },
  });
};

export async function sendEmail({
  subject,
  text,
  to,
  html,
}: SendEmailOptions): Promise<EmailResult> {
  const transporter = createTransporter();

  try {
    // Verify connection configuration
    await transporter.verify();

    const result = await transporter.sendMail({
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
    } as SendMailOptions);

    console.log("Email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    const emailError = error as EmailError;

    console.error("Email sending failed:", {
      error: emailError.message,
      code: emailError.code,
      command: emailError.command,
      response: emailError.response,
      responseCode: emailError.responseCode,
      timestamp: new Date().toISOString(),
      recipient: to,
      subject: subject,
    });

    if (emailError.code === "ECONNECTION" || emailError.code === "ETIMEDOUT") {
      return {
        success: false,
        error: "Unable to connect to email server. Please try again later.",
      };
    }

    if (emailError.code === "EAUTH") {
      return {
        success: false,
        error: "Email authentication failed. Please check credentials.",
      };
    }

    return {
      success: false,
      error: `Failed to send email: ${emailError.message}`,
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

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: EmailResult = {
    success: false,
    error: "No attempts made",
  };

  while (attempts < maxAttempts) {
    try {
      const result = await sendEmail({
        subject: "Welcome to XcelTutors - Please Confirm Your Email",
        text: `Welcome to XcelTutors! We're excited to have you on board. Please confirm your email by clicking on the following link: ${confirmationUrl}`,
        html: `
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
         </html>`,
        to,
      });

      if (result.success) {
        return result;
      }

      lastError = result;
      attempts++;

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    } catch (error) {
      attempts++;
      const emailError = error as EmailError;

      lastError = {
        success: false,
        error: emailError.message,
      };

      if (attempts === maxAttempts) {
        console.error("All email attempts failed for:", {
          to,
          confirmationToken,
          timestamp: new Date().toISOString(),
          error: lastError.error,
        });

        return lastError;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }

  return lastError;
}

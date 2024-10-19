import nodemailer from "nodemailer";
import { env } from "@/lib/env.mjs";

// Create a transporter using Zoho's SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  subject: string;
  text: string;
  to: string;
  html: string;
}

export async function sendEmail({
  subject,
  text,
  to,
  html,
}: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendConfirmationEmail(
  to: string,
  confirmationToken: string
): Promise<void> {
  const confirmationUrl = `${env.NEXT_PUBLIC_API_URL}/auth/confirm/${confirmationToken}`;
  const subject = "Welcome to XcelTutors - Please Confirm Your Email";
  const text = `Welcome to XcelTutors! We're excited to have you on board. Please confirm your email by clicking on the following link: ${confirmationUrl}`;
  const html = `
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

  await sendEmail({ subject, text, html, to });
}

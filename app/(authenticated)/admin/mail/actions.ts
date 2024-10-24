"use server";

import {
  getSmtpServerInfo,
  pingSmtp,
  sendEmail,
} from "@/services/email/emailService";
import { emailSchema, type EmailFormData } from "./schemas";
import { wrapDomainError } from "@/lib/utils/actionUtils";
import { DomainError, Errors } from "@/services/domainError";
import type { DomainResponse } from "@/lib/utils/actionUtils";
import { SmtpServerInfo } from "@/services/email/types";

type EmailResponse = {
  message: string;
};

export async function sendTestEmailAction(
  data: EmailFormData
): Promise<DomainResponse<EmailResponse>> {
  console.log("sending mail");

  return wrapDomainError(async () => {
    const result = emailSchema.safeParse(data);
    if (!result.success) {
      throw new DomainError(Errors.Validation.InvalidInput);
    }

    const { to, subject, body } = result.data;

    await sendEmail({
      to,
      subject,
      text: body,
      html: body,
    });

    return { message: "Test email sent successfully" };
  });
}

export async function getSmtpServerInfoAction(): Promise<
  DomainResponse<SmtpServerInfo>
> {
  return wrapDomainError(async () => {
    return await getSmtpServerInfo();
  });
}

export async function pingSmtpServerAction(): Promise<
  DomainResponse<EmailResponse>
> {
  return wrapDomainError(async () => {
    const result = await pingSmtp();
    return {
      message: result.message,
    };
  });
}

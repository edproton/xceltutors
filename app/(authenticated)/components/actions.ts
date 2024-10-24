"use server";

import { revalidatePath } from "next/cache";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
} from "@/lib/utils/cookiesUtils";
import { invalidateSession } from "@/services/sessionService";
import { DomainResponse, wrapDomainError } from "@/lib/utils/actionUtils";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<DomainResponse<void>> {
  return wrapDomainError(async () => {
    const sessionId = await getCurrentSession();
    await invalidateSession(sessionId);
    deleteSessionTokenCookie();
  });
}

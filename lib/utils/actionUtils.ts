// actionUtils.ts
import { DomainError } from "@/services/domainError";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export type ActionResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      message: string;
    };

export type ActionOptions<T> = {
  handler: () => Promise<T>;
  onSuccess?: (data: T) => { message: string; revalidatePath?: string };
  onError?: (error: any) => { message?: string };
};

export async function handleAction<T>(
  options: ActionOptions<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await options.handler();

    let message = "Operation successful";
    if (options.onSuccess) {
      const successResult = options.onSuccess(data);
      message = successResult.message || message;

      if (successResult.revalidatePath) {
        revalidatePath(successResult.revalidatePath);
      }
    }

    return { success: true, message, data };
  } catch (error: unknown) {
    let message = "An unexpected error occurred";

    if (error instanceof DomainError || error instanceof ZodError) {
      message = error.message;
    }

    if (options.onError) {
      const errorResult = options.onError(error);
      message = errorResult.message || message;
    }

    return {
      success: false,
      message,
    };
  }
}

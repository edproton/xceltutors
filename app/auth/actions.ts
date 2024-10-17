"use server";

import { handleAction } from "@/lib/utils/actionUtils";
import {
  signUp,
  signIn,
  signOut,
  SignUpParams,
  SignInParams,
} from "@/services/authService";

export const signUpAction = (params: SignUpParams) =>
  handleAction({
    handler: () => signUp(params),
    onSuccess: () => ({
      message: "User registered successfully",
      revalidatePath: "/",
    }),
  });

export const signInAction = (params: SignInParams) =>
  handleAction({
    handler: () => signIn(params),
    onSuccess: () => ({
      message: "User signed in successfully",
      revalidatePath: "/",
    }),
  });

export const signOutAction = (sessionId: string) =>
  handleAction({
    handler: () => signOut(sessionId),
    onSuccess: () => ({
      message: "User signed out successfully",
      revalidatePath: "/",
    }),
  });

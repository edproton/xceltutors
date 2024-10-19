import { Metadata } from "next";
import SignInPage from "./SignInPage";
import AuthLayout from "../auth-layout";

export const metadata: Metadata = {
  title: "Sign In | XcelTutors",
  description:
    "Sign in to your XcelTutors account and access your personalized learning experience.",
};

export default function SignInRoute() {
  return (
    <AuthLayout title="Sign In to XcelTutors">
      <SignInPage />
    </AuthLayout>
  );
}

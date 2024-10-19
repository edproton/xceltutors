import { Metadata } from "next";
import AuthLayout from "../auth-layout";
import SignUpPage from "./SignUpPage";

export const metadata: Metadata = {
  title: "Sign Up | XcelTutors",
  description:
    "Create your account on XcelTutors and start your learning journey.",
};

export default function SignUpRoute() {
  return (
    <AuthLayout title="Join XcelTutors">
      <SignUpPage />
    </AuthLayout>
  );
}

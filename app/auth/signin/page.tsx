import { Metadata, Viewport } from "next";
import SignInPage from "./SignInPage";
import AuthLayout from "../auth-layout";

export const metadata: Metadata = {
  title: "Sign In | XcelTutors - Access Your Learning Dashboard",
  description:
    "Sign in to your XcelTutors account to continue your learning journey. Access your personalized tutoring sessions, learning materials, and progress tracking.",
  keywords:
    "signin, login, student portal, tutor platform, learning dashboard, online tutoring access, education portal, learning platform login",
  authors: [{ name: "XcelTutors" }],
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: "/auth/signin",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function SignInRoute() {
  return (
    <AuthLayout title="Welcome Back to XcelTutors">
      <SignInPage />
    </AuthLayout>
  );
}

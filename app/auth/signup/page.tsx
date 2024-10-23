import { Metadata, Viewport } from "next";
import AuthLayout from "../auth-layout";
import SignUpPage from "./SignUpPage";

export const metadata: Metadata = {
  title: "Sign Up | XcelTutors - Start Your Learning Journey",
  description:
    "Create your account on XcelTutors and get access to expert tutors in Mathematics, Science, Languages, and more. Begin your personalized learning experience today.",
  keywords:
    "signup, registration, create account, online tutoring, student registration, tutor platform, education platform, learning platform",
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
    canonical: "/auth/signup",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function SignUpRoute() {
  return (
    <AuthLayout title="Join XcelTutors">
      <SignUpPage />
    </AuthLayout>
  );
}

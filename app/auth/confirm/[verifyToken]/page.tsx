import { Metadata } from "next";
import ConfirmEmailPage from "./ConfirmEmailPage";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Confirm Your Email - XcelTutors",
  description:
    "Verify your email address to complete your registration with XcelTutors.",
  openGraph: {
    title: "Confirm Your Email - XcelTutors",
    description:
      "Verify your email address to complete your registration with XcelTutors.",
    type: "website",
    url: `${env.NEXT_PUBLIC_API_URL}/auth/confirm`,
    siteName: "XcelTutors",
  },
};

export default function Page({ params }: { params: { verifyToken: string } }) {
  return <ConfirmEmailPage params={params} />;
}

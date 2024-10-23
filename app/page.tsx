import { Metadata, Viewport } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: "XcelTutors - Expert Online Tutoring | Learn Anything, Anytime",
  description:
    "Get expert tutoring in Mathematics, Science, Languages, History, Arts, and Technology. Connect with experienced tutors online and unlock your academic potential.",
  keywords:
    "online tutoring, expert tutors, mathematics tutoring, science tutoring, language learning, academic success, online education",
  authors: [{ name: "XcelTutors" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function HomePageRoute() {
  return <HomePage />;
}

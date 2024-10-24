import { Metadata } from "next";
import NotFoundWrapper from "./not-found-client";
import { getUserBySession } from "./(authenticated)/dashboard/actions";

export const metadata: Metadata = {
  title: "404 - Page Not Found | XcelTutors",
  description:
    "Oops! The page you're looking for in XcelTutors tutor booking system cannot be found. Let's get you back to finding the perfect tutor.",
};

export default async function NotFoundPage() {
  const userSessionData = await getUserBySession();

  return <NotFoundWrapper isLoggedIn={userSessionData !== null} />;
}

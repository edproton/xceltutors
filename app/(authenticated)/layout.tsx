import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";
import { getUserBySession } from "./dashboard/actions";
import { UserProvider } from "@/providers/user-provider";

export const metadata: Metadata = {
  title: "XcelTutors",
  description: "Tutoring platform for excellence",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getUserBySession();

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <UserProvider initialData={sessionData}>
          <SidebarProvider>
            <CustomSidebar>{children}</CustomSidebar>
          </SidebarProvider>
        </UserProvider>
      </div>
    </>
  );
}

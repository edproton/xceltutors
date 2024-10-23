import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";
import { getUserBySession } from "./dashboard/actions";

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
  const { user } = await getUserBySession();

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <CustomSidebar user={user}>{children}</CustomSidebar>
        </SidebarProvider>
      </div>
    </>
  );
}

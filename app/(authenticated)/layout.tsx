import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";
import { getUserBySession } from "./dashboard/actions";
import { UserProvider } from "@/providers/user-provider";
import ErrorDialog from "@/components/ui/error-dialog";

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
  const sessionDataResult = await getUserBySession();

  if (sessionDataResult.isError) {
    return <ErrorDialog error={sessionDataResult.error} />;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <UserProvider initialData={sessionDataResult.data}>
          <SidebarProvider>
            <CustomSidebar>{children}</CustomSidebar>
          </SidebarProvider>
        </UserProvider>
      </div>
    </>
  );
}

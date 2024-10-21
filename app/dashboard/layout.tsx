import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "./components/CustomSidebar";
import { getUserBySession } from "./actions";

export const metadata: Metadata = {
  title: "XcelTutors",
  description: "Tutoring platform for excellence",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserBySession();
  console.log(user);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <CustomSidebar>{children}</CustomSidebar>
        </SidebarProvider>
      </div>
    </div>
  );
}

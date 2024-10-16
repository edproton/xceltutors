import { ReactNode } from "react";

export default function UserManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {children}
    </div>
  );
}

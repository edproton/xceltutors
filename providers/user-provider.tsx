"use client";

import { SessionData } from "@/app/(authenticated)/dashboard/actions";
import { createContext, useContext } from "react";

type UserContextType = {
  user: SessionData["user"];
  session: SessionData["session"];
  roles: SessionData["roles"];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: SessionData;
}) => {
  return (
    <UserContext.Provider
      value={{
        user: initialData.user,
        session: initialData.session,
        roles: initialData.roles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Optional: Add role-checking utility
export const useHasRole = (roleId: number) => {
  const { roles } = useUser();
  return roles.some((role) => role.id === roleId);
};

// Optional: Add session validity checking
export const useIsSessionValid = () => {
  const { session } = useUser();
  return new Date(session.expiresAt) > new Date();
};

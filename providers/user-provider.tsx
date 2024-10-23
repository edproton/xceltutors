"use client";

import { getUserBySession } from "@/app/(authenticated)/dashboard/actions";
import { createContext, useContext } from "react";

type User = Awaited<ReturnType<typeof getUserBySession>>["user"];

type UserContextType = {
  user: User;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User;
}) => {
  return (
    <UserContext.Provider value={{ user: initialUser }}>
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

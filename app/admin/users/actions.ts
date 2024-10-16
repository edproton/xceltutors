"use server";

import { getAllUsers } from "@/services/userService";
import { handleAction } from "@/lib/utils/actionUtils";

export const fetchUsersAction = () =>
  handleAction({
    handler: () => getAllUsers(),
  });

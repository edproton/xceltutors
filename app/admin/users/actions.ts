"use server";

import { getAllUsers } from "@/services/userService";

export const fetchUsersAction = () => getAllUsers();

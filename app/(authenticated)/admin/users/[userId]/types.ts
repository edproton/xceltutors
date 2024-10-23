import { SelectUser } from "@/db/schemas/userSchema";

export interface UserWithRoles extends SelectUser {
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

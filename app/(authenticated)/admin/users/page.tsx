import { getUsersAction } from "./actions";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const users = await getUsersAction();
  return (
    <div>
      <UsersTable users={users} />
    </div>
  );
}

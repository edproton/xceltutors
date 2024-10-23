import { Errors } from "@/services/domainError";
import { getUsersAction } from "./actions";
import UsersTable from "./UsersTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function UsersPage() {
  const users = await getUsersAction();

  if (users.isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {users.error === Errors.Server.InternalError
              ? "An unexpected error occurred. Please try again later."
              : users.error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <UsersTable users={users.data} />
    </div>
  );
}

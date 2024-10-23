import { notFound } from "next/navigation";
import { type Metadata } from "next/types";
import { getAllRoles, getUserWithRoles } from "./actions";
import UserDetailsPage from "./UserDetailsPage";
import ErrorDialog from "@/components/ui/error-dialog";

interface Props {
  params: { userId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = parseInt(params.userId, 10);

  if (isNaN(userId)) {
    return {
      title: "User Not Found",
    };
  }

  const userResult = await getUserWithRoles(userId);
  if (userResult.isError) {
    return {
      title: "Error Loading User",
    };
  }

  const { firstName, lastName } = userResult.data;
  return {
    title: `${firstName} ${lastName} - User Details`,
    description: `Manage user details and roles for ${firstName} ${lastName}`,
  };
}

export default async function UserDetailsRouter({ params }: Props) {
  const userId = parseInt(params.userId, 10);

  if (isNaN(userId)) {
    notFound();
  }

  const userWithRolesResult = await getUserWithRoles(userId);
  if (userWithRolesResult.isError) {
    return <ErrorDialog error={userWithRolesResult.error} />;
  }

  const availableRoles = await getAllRoles();
  if (availableRoles.isError) {
    return <ErrorDialog error={availableRoles.error} />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Details</h1>
      <UserDetailsPage
        user={userWithRolesResult.data}
        availableRoles={availableRoles.data}
      />
    </div>
  );
}

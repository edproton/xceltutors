import { getCurrentSession } from "@/lib/utils/cookiesUtils";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  return <div>{JSON.stringify(session)}</div>;
}

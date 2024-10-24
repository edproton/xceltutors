// app/api/auth/validate-session/route.ts
import { getUserBySession } from "@/app/(authenticated)/dashboard/actions";

export async function GET() {
  const result = await getUserBySession();

  if (!result.isSuccess) {
    return Response.json({ type: result.error }, { status: 401 });
  }

  return Response.json(result.data);
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  updateUserAction,
  getUserByIdAction,
  getUserSessionsAction,
  invalidateUserSessionAction,
  invalidateAllSessionsAction,
} from "./actions";
import {
  updateUserSchema,
  UpdateUserSchema,
  UserType,
} from "@/db/schemas/userSchema";
import { Loader2 } from "lucide-react";
import { SelectSession } from "@/db/schemas/sessionSchema";

export default function UpdateUserForm({
  params,
}: {
  params: { userId: number };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessions, setSessions] = useState<SelectSession[]>([]);

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      type: UserType.student,
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadUserAndSessions() {
      const userResult = await getUserByIdAction(params.userId);
      const sessionsResult = await getUserSessionsAction(params.userId);

      if (userResult.success) {
        form.reset(userResult.data!);
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        router.push("/admin/users");
      }

      if (sessionsResult.success) {
        setSessions(sessionsResult.data);
      }

      setInitialLoading(false);
    }

    loadUserAndSessions();
  }, [params.userId, form, router]);

  async function onSubmit(data: UpdateUserSchema) {
    setIsLoading(true);

    const result = await updateUserAction(data);
    if (result.success) {
      toast({
        title: "User Updated",
        description: "User details updated successfully",
      });

      router.push("/admin/users");
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  }

  async function handleInvalidateSession(sessionId: string) {
    const result = await invalidateUserSessionAction(sessionId);
    if (result.success) {
      toast({
        title: "Session Invalidated",
        description: "User session has been invalidated successfully",
      });
      setSessions(sessions.filter((session) => session.id !== sessionId));
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  async function handleInvalidateAllSessions() {
    const result = await invalidateAllSessionsAction(params.userId);
    if (result.success) {
      toast({
        title: "All Sessions Invalidated",
        description: "All user sessions have been invalidated successfully",
      });
      setSessions([]);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage User</CardTitle>
        <CardDescription>
          See and update the details for the user account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {initialLoading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>User Type</Label>
                <RadioGroup
                  onValueChange={(value) =>
                    form.setValue("type", value as UserType)
                  }
                  value={form.watch("type")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={UserType.student} id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={UserType.tutor} id="tutor" />
                    <Label htmlFor="tutor">Tutor</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>

              {/* New section for user sessions */}
              <div className="space-y-2">
                <Label>User Sessions</Label>
                {sessions.length > 0 ? (
                  <ul className="space-y-2">
                    {sessions.map((session) => (
                      <li
                        key={session.id}
                        className="flex justify-between items-center"
                      >
                        <span>
                          Expires:{" "}
                          {new Date(session.expiresAt).toLocaleString()}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleInvalidateSession(session.id)}
                        >
                          Invalidate
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No active sessions</p>
                )}
                <Button
                  variant="outline"
                  onClick={handleInvalidateAllSessions}
                  disabled={sessions.length === 0}
                >
                  Invalidate All Sessions
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update User"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

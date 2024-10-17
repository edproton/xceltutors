"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { updateUserAction, getUserByIdAction } from "./actions";
import {
  updateUserSchema,
  UpdateUserSchema,
  UserType,
} from "@/db/schemas/userSchema";
import { Loader2 } from "lucide-react";
import React from "react";
import UserSessionsTable from "./UserSessionsTable";

export default function UpdateUserForm({
  params,
}: {
  params: { userId: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backToPage = searchParams.get("backToPage");

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["user", params.userId],
    queryFn: () => getUserByIdAction(params.userId),
  });

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    values: user,
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserAction,
  });

  if (updateUserMutation.isSuccess) {
    toast({
      title: "User Updated",
      description: "User details updated successfully",
    });
    router.push(
      backToPage ? `/admin/users?backToPage=${backToPage}` : "/admin/users"
    );
  }

  if (updateUserMutation.isError) {
    toast({
      title: "Error",
      description: updateUserMutation.error.message,
      variant: "destructive",
    });
  }

  function onSubmit(data: UpdateUserSchema) {
    updateUserMutation.mutate(data);
  }

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-6 w-4 animate-spin" />
      </div>
    );
  }

  if (isUserError) {
    toast({
      title: "Error",
      description: userError?.message || "Failed to load user data",
      variant: "destructive",
    });
    router.push("/admin/users");
    return null;
  }

  if (!user) {
    return <div>User not found</div>;
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
            <Label htmlFor="password">
              Password (leave blank to keep current)
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
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
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active Account</Label>
          </div>

          {/* User sessions section */}
          <div className="space-y-2">
            <Label>User Sessions</Label>
            <UserSessionsTable userId={params.userId} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
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

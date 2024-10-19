"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { createUserAction } from "./actions";
import { createUserSchema, CreateUserSchema } from "@/db/schemas/userSchema";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function CreateUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backToPage = searchParams.get("backToPage");

  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      isActive: true,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUserAction,
  });

  if (createUserMutation.isSuccess) {
    toast({
      title: "User Created",
      description: "User created sucessfully",
    });
    router.push(
      backToPage ? `/admin/users?backToPage=${backToPage}` : "/admin/users"
    );
  }

  if (createUserMutation.isError) {
    toast({
      title: "Error",
      description: createUserMutation.error.message,
      variant: "destructive",
    });
  }

  function onSubmit(data: CreateUserSchema) {
    createUserMutation.mutate(data);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>
          Enter the details for the new user account.
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
            <Label htmlFor="password">Password</Label>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active Account</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create User"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function CreateUserFormPage() {
  <Suspense>
    <CreateUserForm />
  </Suspense>;
}

"use client";

import { useState } from "react";
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
import { createUserAction } from "./actions";
import {
  createUserSchema,
  CreateUserSchema,
  UserType,
} from "@/db/schemas/userSchema";
import { Loader2 } from "lucide-react";

export default function CreateUserForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      type: UserType.student,
      isActive: true,
    },
  });

  async function onSubmit(data: CreateUserSchema) {
    setIsLoading(true);

    const result = await createUserAction(data);
    if (result.success) {
      toast({
        title: "User Created",
        description: result.message,
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
          <div className="space-y-2">
            <Label>User Type</Label>
            <RadioGroup
              onValueChange={(value) =>
                form.setValue("type", value as UserType)
              }
              defaultValue={form.getValues("type")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tutor" id="tutor" />
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
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

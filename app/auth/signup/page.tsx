"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signUpAction } from "./actions";
import {
  signUpFormSchema,
  SignUpFormSchema,
} from "@/services/auth/authServiceSchemas";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserType } from "@/db/schemas/userSchema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
  });

  console.log(form.formState.errors);

  const signUpMutation = useMutation({
    mutationFn: signUpAction,
    onError(error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  function onSignUpSubmit(data: SignUpFormSchema) {
    signUpMutation.mutate(data);
  }

  if (signUpMutation.isSuccess) {
    router.push("/auth/confirm");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSignUpSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserType.student}>Student</SelectItem>
                  <SelectItem value={UserType.tutor}>Tutor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? "Loading..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}

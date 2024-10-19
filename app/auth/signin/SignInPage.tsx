"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { credentialsSignInAction } from "./actions";
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  credentialsSignInFormSchema,
  CredentialsSignInFormSchema,
} from "@/services/auth/providers/credentials/schemas/signInSchema";
import Providers from "../shared/Providers";

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const form = useForm<CredentialsSignInFormSchema>({
    resolver: zodResolver(credentialsSignInFormSchema),
  });

  const signInMutation = useMutation({
    mutationFn: credentialsSignInAction,
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError(error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  function onSignInSubmit(data: CredentialsSignInFormSchema) {
    signInMutation.mutate(data);
  }

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <Providers
              onEmailClick={() => setShowEmailForm(true)}
              authType="signin"
            />
          ) : (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowEmailForm(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Choose another option
              </Button>
              <Separator />
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSignInSubmit)}
                  className="space-y-4"
                >
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
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 text-center text-sm"
      >
        {"Don't have an account? "}
        <Link
          href="/auth/signup"
          className="text-primary font-semibold hover:underline"
        >
          Sign up
        </Link>
      </motion.p>
    </>
  );
}

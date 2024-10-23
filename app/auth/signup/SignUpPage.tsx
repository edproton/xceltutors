"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { credentialsSignUpAction } from "./actions";

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
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CredentialsSignUpFormSchema,
  credentialsSignUpFormSchema,
} from "@/services/auth/providers/credentials/schemas/signUpSchema";
import Providers from "../shared/Providers";

const SuccessIcon = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
    }}
  >
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
  </motion.div>
);

export default function SignUpPage() {
  const { toast } = useToast();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const form = useForm<CredentialsSignUpFormSchema>({
    resolver: zodResolver(credentialsSignUpFormSchema),
  });

  const signUpMutation = useMutation({
    mutationFn: credentialsSignUpAction,
    onSuccess: () => {
      setShowSuccessDialog(true);
    },
    onError(error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  function onSignUpSubmit(data: CredentialsSignUpFormSchema) {
    signUpMutation.mutate(data);
  }

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <Providers
              onEmailClick={() => setShowEmailForm(true)}
              authType="signup"
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
                  onSubmit={form.handleSubmit(onSignUpSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your first name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your last name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                            placeholder="Create a strong password"
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signUpMutation.isPending}
                  >
                    {signUpMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </form>
              </Form>
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
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </motion.p>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <SuccessIcon />
            <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
              Confirm Your Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2">
              <p>
                Please check your email and confirm your account to start
                booking your tutoring sessions.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button
            onClick={() => setShowSuccessDialog(false)}
            className="mt-4 w-full font-semibold"
          >
            Got it!
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

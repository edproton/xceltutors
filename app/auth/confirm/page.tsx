"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface ConfirmEmailPageProps {
  userId: string;
  userEmail: string;
}

async function confirmEmail(userId: string): Promise<boolean> {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real scenario, you'd make an API call here
  // return await api.post(`/users/${userId}/confirm-email`)
  return true;
}

export default function ConfirmEmailPage({
  userId,
  userEmail,
}: ConfirmEmailPageProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const confirmEmailMutation = useMutation({
    mutationFn: () => confirmEmail(userId),
    onSuccess: () => {
      setTimeout(() => setShowWelcome(true), 2000);
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWelcome && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showWelcome, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      console.log("Redirecting...");
      // window.location.href = "/dashboard" // Uncomment this line to actually redirect
    }
  }, [countdown]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <AnimatePresence>
        {!showWelcome ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-center">
                  We've sent you a confirmation link
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div
                  className="p-3 rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <Mail className="w-10 h-10 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Please check your email inbox for <strong>{userEmail}</strong>{" "}
                  and click on the provided link to confirm your account.
                </p>
                {!confirmEmailMutation.isSuccess && (
                  <div className="w-full h-2 bg-secondary overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1,
                        ease: "linear",
                      }}
                    />
                  </div>
                )}
                {(confirmEmailMutation.isPending ||
                  confirmEmailMutation.isIdle) && (
                  <p className="text-xs text-center text-muted-foreground">
                    Waiting for confirmation...
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {confirmEmailMutation.isError && (
                  <p className="text-red-500 text-sm">
                    Failed to confirm email. Please try again.
                  </p>
                )}
                {confirmEmailMutation.isSuccess ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Email confirmed successfully!</span>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => confirmEmailMutation.mutate()}
                    disabled={confirmEmailMutation.isPending}
                  >
                    {confirmEmailMutation.isPending
                      ? "Confirming..."
                      : "Confirm Email"}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive an email? Check your spam folder or{" "}
                  <a href="#" className="text-primary hover:underline">
                    request a new one
                  </a>
                  .
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Welcome to XcelTutors!
                </CardTitle>
                <CardDescription className="text-center">
                  Your journey to excellence begins now
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div
                  className="p-3 rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  We're excited to have you on board! Get ready to unlock your
                  full potential with our expert tutors and personalized
                  learning experiences.
                </p>
                <p className="text-lg font-semibold text-primary">
                  {countdown > 0
                    ? `Redirecting in ${countdown}...`
                    : "Redirecting..."}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  {countdown === 0 ? (
                    <>
                      If you weren't redirected automatically,{" "}
                      <a href="#" className="text-primary hover:underline">
                        click here to access your dashboard
                      </a>
                      .
                    </>
                  ) : (
                    "You'll be automatically redirected to your dashboard."
                  )}
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

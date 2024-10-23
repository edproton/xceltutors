"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  CheckCircle,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { confirmEmailAction } from "./actions";
import { useMutation } from "@tanstack/react-query";
import { Errors } from "@/services/domainError";

interface ConfirmEmailPageProps {
  params: {
    verifyToken: string;
  };
}

export default function ConfirmEmailPage({ params }: ConfirmEmailPageProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const { verifyToken } = params;

  const confirmEmailMutation = useMutation({
    mutationFn: () => confirmEmailAction(verifyToken),
    onSuccess: () => {
      setShowWelcome(true);
    },
    onError: (e: Error) => {
      if (e.message === Errors.User.AlreadyConfirmed) {
        router.push("/dashboard");
      }
    },
  });

  useEffect(() => {
    if (verifyToken) {
      confirmEmailMutation.mutate();
    }
  }, [verifyToken]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWelcome && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showWelcome, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/dashboard");
    }
  }, [countdown, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!showWelcome ? (
          <motion.div
            key="confirming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Confirming Your Email
                </CardTitle>
                <CardDescription className="text-center">
                  {"We're verifying your email address"}
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
                  Please wait while we confirm your email address. This should
                  only take a moment.
                </p>
                {confirmEmailMutation.isPending && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Verifying...
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {confirmEmailMutation.isError && (
                  <div className="flex flex-col items-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    <p className="text-destructive text-sm text-center">
                      {confirmEmailMutation.error.message}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => confirmEmailMutation.mutate()}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Welcome to XcelTutors!
                </CardTitle>
                <CardDescription className="text-center">
                  Your journey to excellence begins now
                  <motion.div
                    className="flex items-center justify-center space-x-2 text-green-600 mt-2"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Email confirmed successfully!</span>
                  </motion.div>
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
                  {
                    "We're excited to have you on board! Get ready to unlock your full potential with our expert tutors and personalized learning experiences."
                  }
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
                      {"If you weren't redirected automatically, "}
                      <a
                        href="/dashboard"
                        className="text-primary hover:underline"
                      >
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

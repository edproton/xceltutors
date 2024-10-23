"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  AuthProviderItem,
  authProviders,
} from "@/components/constants/auth-providers";

interface ProvidersProps {
  onEmailClick: () => void;
  authType: "signin" | "signup";
}

export default function Providers({ onEmailClick, authType }: ProvidersProps) {
  const actionText = authType === "signup" ? "Sign up" : "Sign in";

  const ProviderButton = ({ provider }: { provider: AuthProviderItem }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" className="w-full" asChild>
        <Link href={`/auth/providers/${provider.name.toLowerCase()}`}>
          {provider.icon}
          {actionText} with {provider.name}
        </Link>
      </Button>
    </motion.div>
  );

  return (
    <motion.div
      key="auth-options"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {authProviders.map((provider) => (
        <ProviderButton key={provider.name} provider={provider} />
      ))}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button variant="outline" className="w-full" onClick={onEmailClick}>
          <Mail className="mr-2 h-4 w-4" />
          {actionText} with Email
        </Button>
      </motion.div>
    </motion.div>
  );
}

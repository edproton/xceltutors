"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen">
      <AnimatePresence>
        <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://epe.brightspotcdn.com/94/2d/8ed27aa34da0a197b1d819ec39a5/teacher-tutor-student-librarian-1137620335.jpg"
              alt="XcelTutors Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-center p-8 bg-black bg-opacity-50 rounded-lg cursor-pointer"
          >
            <h1 className="text-4xl font-bold text-white mb-4">XcelTutors</h1>
            <p className="text-xl text-white">
              Empowering education through personalized connections
            </p>
          </motion.div>
        </div>
      </AnimatePresence>

      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center relative">
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 z-10"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="w-full max-w-md"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold mb-6 text-center"
          >
            {title}
          </motion.h2>

          {children}
        </motion.div>
      </div>
    </div>
  );
}

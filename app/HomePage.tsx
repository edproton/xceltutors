"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Zap,
  Calendar,
  Calculator,
  FlaskConical,
  Languages,
  Clock,
  Palette,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const subjects = [
    { name: "Mathematics", Icon: Calculator },
    { name: "Science", Icon: FlaskConical },
    { name: "Languages", Icon: Languages },
    { name: "History", Icon: Clock },
    { name: "Arts", Icon: Palette },
    { name: "Technology", Icon: Cpu },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  const subjectVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleCtaClick = () => {
    setTimeout(() => {
      router.push("/auth/signup");
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          {"XcelTutors".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
          <Button asChild>
            <Link href="/auth/signin">Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Learn Anything, Anytime
        </motion.h2>

        <motion.p
          className="text-xl text-center mb-8 max-w-2xl relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span className="relative inline-block">
            {"Expert Tutoring, Anytime, Anywhere"
              .split("")
              .map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + index * 0.03, duration: 0.2 }}
                >
                  <span className="relative">
                    <span className="absolute inset-0 blur-sm bg-primary/30 animate-pulse"></span>
                    <span className="relative z-10">{char}</span>
                  </span>
                </motion.span>
              ))}
          </span>
        </motion.p>

        <AnimatePresence>
          {showContent && (
            <motion.div
              className="w-full max-w-4xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="flex flex-wrap justify-center gap-4 mb-12"
                variants={containerVariants}
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap="tap"
                >
                  <Button
                    className="text-lg px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white"
                    onClick={handleCtaClick}
                  >
                    <Zap className="mr-2 h-5 w-5" /> Unlock Your Success Now
                  </Button>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                  >
                    <Button className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600">
                      <Calendar className="mr-2 h-5 w-5" /> Free Session
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full"
                variants={containerVariants}
              >
                {subjects.map(({ name, Icon }) => (
                  <motion.div
                    key={name}
                    className="bg-card text-card-foreground p-6 rounded-lg shadow-lg"
                    variants={subjectVariants}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex items-center mb-4">
                      <Icon className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">{name}</h3>
                    </div>
                    <p>
                      Discover the wonders of {name.toLowerCase()} with our
                      expert tutors.
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-4 text-center">
        <p>&copy; 2024 XcelTutors. All rights reserved.</p>
      </footer>
    </div>
  );
}

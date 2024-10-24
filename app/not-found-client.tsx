"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Book,
  Pencil,
  Calculator,
  TestTube,
  Music,
  Pizza,
  Lightbulb,
  Glasses,
  Eraser,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";

const NotFoundClient = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paths, setPaths] = useState<Array<{ path: string; color: string }>>(
    []
  );
  const [currentPath, setCurrentPath] = useState("");
  const [strokeColor, setStrokeColor] = useState(
    theme === "dark" ? "#ffffff" : "#000000"
  );
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(theme === "dark" ? 80 : 50);
  const svgRef = useRef<SVGSVGElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const angle = useTransform([mouseX, mouseY], (latest: number[]) => {
    const [x, y] = latest;
    return (
      Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) *
      (180 / Math.PI)
    );
  });

  const [isHomeButtonPulsing, setIsHomeButtonPulsing] = useState(false);
  const [isDashboardButtonPulsing, setIsDashboardButtonPulsing] =
    useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Button animations setup
  useEffect(() => {
    const triggerButtonAnimations = () => {
      const randomButton = Math.random();

      if (randomButton > 0.5) {
        setIsHomeButtonPulsing(true);
        setTimeout(() => setIsHomeButtonPulsing(false), 2000);
      } else if (isLoggedIn) {
        setIsDashboardButtonPulsing(true);
        setTimeout(() => setIsDashboardButtonPulsing(false), 2000);
      }
    };

    const animationInterval = setInterval(() => {
      if (!isDrawing) {
        triggerButtonAnimations();
      }
    }, 10000);

    return () => clearInterval(animationInterval);
  }, [isLoggedIn, isDrawing]);

  useEffect(() => {
    setStrokeColor(theme === "dark" ? "#ffffff" : "#000000");
    setLightness(theme === "dark" ? 80 : 50);
  }, [theme]);

  useEffect(() => {
    setMounted(true);

    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (isDrawing && svgRef.current) {
          const svgRect = svgRef.current.getBoundingClientRect();
          const x = e.clientX - svgRect.left;
          const y = e.clientY - svgRect.top;
          setCurrentPath((prev) => `${prev} L${x} ${y}`);
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (svgRef.current) {
          const svgRect = svgRef.current.getBoundingClientRect();
          const x = e.clientX - svgRect.left;
          const y = e.clientY - svgRect.top;
          setCurrentPath(`M${x} ${y}`);
          setIsDrawing(true);
        }
      };

      const handleMouseUp = () => {
        if (isDrawing) {
          setPaths((prev) => [
            ...prev,
            { path: currentPath, color: strokeColor },
          ]);
          setCurrentPath("");
          setIsDrawing(false);
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDrawing, mouseX, mouseY, currentPath, strokeColor, isMobile]);

  const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  useEffect(() => {
    const { h, s, l } = hexToHSL(strokeColor);
    setHue(h);
    setSaturation(s);
    setLightness(l);
  }, [strokeColor]);

  if (!mounted) return null;

  const clearBoard = () => {
    setPaths([]);
    setCurrentPath("");
  };

  const subjects = [
    { icon: Book, color: "text-primary" },
    { icon: Calculator, color: "text-accent" },
    { icon: TestTube, color: "text-muted-foreground" },
    { icon: Music, color: "text-primary" },
    { icon: Pizza, color: "text-accent" },
    { icon: Lightbulb, color: "text-primary" },
    { icon: Glasses, color: "text-muted-foreground" },
  ];

  const handleColorPreviewClick = () => {
    if (colorPickerRef.current) {
      colorPickerRef.current.click();
    }
  };

  const buttonVariants = {
    initial: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    },
  };

  const footerButtonVariants = {
    initial: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const footerContainerVariants = {
    initial: {
      y: 100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 1,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background text-foreground p-4 select-none">
      {!isMobile && (
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {paths.map((path, index) => (
            <path
              key={index}
              d={path.path}
              fill="none"
              stroke={path.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <path
            d={currentPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {subjects.map((Subject, i) => (
        <motion.div
          key={i}
          className={`absolute ${Subject.color} hidden md:block`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.5,
            scale: [0.5, 1, 0.5],
            x:
              i % 2 === 0
                ? [0, window.innerWidth, 0]
                : [window.innerWidth, 0, window.innerWidth],
            y:
              i % 3 === 0
                ? [0, window.innerHeight, 0]
                : [window.innerHeight, 0, window.innerHeight],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Subject.icon className="w-6 h-6 md:w-8 md:h-8" />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 md:mb-8"
      >
        <Book className="w-24 h-24 md:w-32 md:h-32 text-primary" />
      </motion.div>

      <motion.h1
        className="text-3xl md:text-6xl font-bold mb-4 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        404 - Page Not Found
      </motion.h1>

      <motion.p
        className="text-lg md:text-2xl mb-6 md:mb-8 text-center max-w-md text-muted-foreground"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Oops! This page took a coffee break and forgot to come back.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8 w-full max-w-md px-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 120 }}
      >
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate={isHomeButtonPulsing ? "pulse" : "initial"}
          whileHover="hover"
          whileTap="tap"
          className="relative flex-1"
        >
          <Button asChild variant="default" className="relative w-full">
            <Link href="/">
              Return to Tutor Search
              {isHomeButtonPulsing && (
                <motion.span
                  className="absolute inset-0 rounded-md bg-primary"
                  initial={{ scale: 1, opacity: 0.25 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2 }}
                />
              )}
            </Link>
          </Button>
        </motion.div>

        {isLoggedIn && (
          <motion.div
            variants={buttonVariants}
            initial="initial"
            animate={isDashboardButtonPulsing ? "pulse" : "initial"}
            whileHover="hover"
            whileTap="tap"
            className="relative flex-1"
          >
            <Button asChild variant="outline" className="relative w-full">
              <Link href="/dashboard">
                Go to Dashboard
                {isDashboardButtonPulsing && (
                  <motion.span
                    className="absolute inset-0 rounded-md bg-primary"
                    initial={{ scale: 1, opacity: 0.25 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2 }}
                  />
                )}
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute text-6xl md:text-9xl font-bold text-primary/5 dark:text-primary/10 select-none"
        initial={{ y: -100 }}
        animate={{ y: [-20, 20] }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
      >
        404
      </motion.div>

      {!isMobile && (
        <motion.div
          className="fixed bottom-4 left-0 right-0 mx-auto flex items-center justify-center bg-background/80 dark:bg-background/90 px-2 py-1.5 rounded-lg shadow-lg max-w-xl border border-border"
          variants={footerContainerVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          style={{
            transformOrigin: "center",
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          transition={{
            scale: {
              type: "tween",
              duration: 0.5,
              ease: "easeOut",
            },
          }}
        >
          <div className="flex items-center space-x-2 w-full">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <motion.div
                    variants={footerButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      style={{ backgroundColor: strokeColor }}
                      className="shadow-md relative overflow-hidden"
                    >
                      <Pencil
                        className="h-4 w-4"
                        style={{
                          color: theme === "dark" ? "#000000" : "#ffffff",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.5, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Color Preview
                      </Label>
                      <motion.div
                        className="w-full h-12 rounded-md shadow-inner cursor-pointer"
                        style={{ backgroundColor: strokeColor }}
                        onClick={handleColorPreviewClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      />
                      <input
                        ref={colorPickerRef}
                        type="color"
                        value={strokeColor}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setStrokeColor(newColor);
                          const { h, s, l } = hexToHSL(newColor);
                          setHue(h);
                          setSaturation(s);
                          setLightness(l);
                        }}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Hue</Label>
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[hue]}
                        onValueChange={(value) => {
                          const newHue = value[0];
                          setHue(newHue);
                          setStrokeColor(
                            hslToHex(newHue, saturation, lightness)
                          );
                        }}
                        className="flex-grow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Saturation</Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[saturation]}
                        onValueChange={(value) => {
                          const newSaturation = value[0];
                          setSaturation(newSaturation);
                          setStrokeColor(
                            hslToHex(hue, newSaturation, lightness)
                          );
                        }}
                        className="flex-grow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Lightness</Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[lightness]}
                        onValueChange={(value) => {
                          const newLightness = value[0];
                          setLightness(newLightness);
                          setStrokeColor(
                            hslToHex(hue, saturation, newLightness)
                          );
                        }}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={clearBoard}
                className="shadow-md relative overflow-hidden"
              >
                <Eraser className="h-4 w-4" />
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Tip: Who said 404 pages can't be your canvas? Unleash your inner
              Picasso!
            </p>
          </div>
        </motion.div>
      )}

      {!isMobile && (
        <motion.div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          style={{ rotate: angle }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 1.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <Pencil className="h-8 w-8 md:h-12 md:w-12 text-primary" />
        </motion.div>
      )}
    </div>
  );
};

export default NotFoundClient;

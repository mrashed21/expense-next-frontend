"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      theme={(theme as "light" | "dark" | "system") || "system"}
      richColors
      closeButton
    />
  );
}

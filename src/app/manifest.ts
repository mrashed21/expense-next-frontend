import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Expense Tracker - Personal & Business Expense Tracker",
    short_name: "Expense Tracker",
    description:
      "Modern, secure financial management, budgeting, and analytics platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

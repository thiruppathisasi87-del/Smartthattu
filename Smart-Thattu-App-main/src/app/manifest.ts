import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartThattu — AI Indian Family Nutrition",
    short_name: "SmartThattu",
    description:
      "AI-powered Indian family nutrition assistant: meal plans, analysis, grocery lists and AI chat.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ff6b35",
    lang: "en",
    categories: ["health", "food", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

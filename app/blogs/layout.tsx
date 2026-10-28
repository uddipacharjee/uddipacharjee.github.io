import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";

// Code only appears in posts, so the monospace face is loaded here rather
// than in the root layout and the home page never downloads it.
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return <div className={jetBrainsMono.variable}>{children}</div>;
}

import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ResultsProvider } from "@/lib/results-context";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "CareerSphere AI",
  description: "Multi-agent AI-powered career planner for skills, jobs, safety, mentorship, and ATS resumes.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <ResultsProvider>{children}</ResultsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

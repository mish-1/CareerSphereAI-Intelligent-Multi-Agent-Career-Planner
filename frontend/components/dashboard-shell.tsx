"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft, Bot, BriefcaseBusiness, FileText, Gauge, HeartHandshake, LayoutDashboard, Settings, ShieldAlert, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume-upload", label: "Resume Upload", icon: FileText },
  { href: "/career-analysis", label: "Career Analysis", icon: Gauge },
  { href: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/safety-reports", label: "Safety Reports", icon: ShieldAlert },
  { href: "/resume-optimizer", label: "Resume Optimizer", icon: Sparkles },
  { href: "/mentor-chat", label: "Mentor Chat", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_30%),linear-gradient(180deg,_#f7f7fb_0%,_#edf1ff_40%,_#ffffff_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-border/80 bg-card/85 p-4 shadow-glow backdrop-blur xl:block">
          <div className="mb-6 rounded-[1.5rem] bg-gradient-to-br from-foreground to-primary p-4 text-background">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.35em] opacity-80">CareerSphere AI</span>
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold leading-tight">Your multi-agent career command center</h1>
            <p className="mt-2 text-sm text-background/80">Skill, safety, mentorship, and ATS optimization in one flow.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator />

          <div className="mt-4 rounded-[1.5rem] border border-border bg-background/80 p-4">
            <Badge className="mb-3">Production-ready scaffold</Badge>
            <p className="text-sm text-muted-foreground">
              Backend: FastAPI + LangGraph
              <br />
              Search: Qdrant + Jina
              <br />
              Auth: Firebase
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-[2rem] border border-border/80 bg-card/85 px-5 py-4 shadow-glow backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">CareerSphere AI</p>
                <h2 className="text-xl font-semibold">Intelligent multi-agent career planning</h2>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="secondary" size="sm">
                  <Link href="/settings" className="inline-flex items-center">
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Connect Firebase
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 rounded-[2rem] border border-border/80 bg-card/70 p-4 shadow-glow backdrop-blur md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

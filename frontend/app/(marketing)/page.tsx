import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, FileSearch, ShieldAlert, Sparkles, UserRoundCheck } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const highlights = [
  { icon: BrainCircuit, title: "Skill analysis", description: "Extract strengths, weaknesses, and role fit from resumes and projects." },
  { icon: FileSearch, title: "Opportunity matching", description: "Rank internships and jobs with semantic scoring and explainability." },
  { icon: ShieldAlert, title: "Safety intelligence", description: "Surface culture risk, toxicity, work-life balance, and women safety signals." },
  { icon: Sparkles, title: "ATS resumes", description: "Rewrite weak bullets, close keyword gaps, and export DOCX/PDF." },
  { icon: Bot, title: "Mentor and confidence agents", description: "Guide the user like a senior mentor and reduce application hesitation." },
  { icon: UserRoundCheck, title: "Protected workflow", description: "Firebase Auth backed access to the career dashboard and APIs." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.10),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-glow backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Production-grade multi-agent career planner
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              CareerSphere AI turns a resume into a full career strategy.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              A modular Next.js + FastAPI platform that analyzes skills, recommends opportunities, checks safety signals, rewrites resumes, and guides the user through the next move.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Link href="/dashboard" className="inline-flex items-center">
                  Open dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary">
                <Link href="/resume-upload">Upload resume</Link>
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Agents", "6 specialized agents"],
                ["Workflow", "LangGraph orchestration"],
                ["Search", "Qdrant + Jina embeddings"],
                ["Auth", "Firebase protected routes"],
              ].map(([label, value]) => (
                <Card key={label} className="animate-floaty">
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full transition hover:-translate-y-1">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription className="mt-2 text-sm leading-6">{item.description}</CardDescription>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4">
            <CardDescription>Security and access</CardDescription>
            <CardTitle>Firebase-ready authentication</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in with email/password or Google, then call the protected FastAPI workflow with an ID token. The backend can verify and attach user context to each agent run.
            </p>
            <Button variant="outline">
              <Link href="/settings">Open settings</Link>
            </Button>
          </Card>
          <AuthPanel />
        </section>
      </div>
    </main>
  );
}

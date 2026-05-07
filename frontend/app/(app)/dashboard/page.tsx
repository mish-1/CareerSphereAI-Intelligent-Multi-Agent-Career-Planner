"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { roadmapItems, dashboardStats, skillBars, opportunityCards } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { SkillBars } from "@/components/skill-bars";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { useResults } from "@/lib/results-context";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { latestResult, results } = useResults();

  return (
    <div className="space-y-6">
      {latestResult && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-start justify-between">
            <div>
              <CardDescription>Latest activity</CardDescription>
              <CardTitle className="mt-2">{latestResult.title}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(latestResult.timestamp).toLocaleString()}
              </p>
              {latestResult.error && (
                <Badge className="mt-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                  Error: {latestResult.error}
                </Badge>
              )}
            </div>
            <Badge variant="secondary">{latestResult.type}</Badge>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <Card>
            <CardDescription>Skill graph</CardDescription>
            <CardTitle className="mt-2">Your current profile strength</CardTitle>
            <div className="mt-6">
              <SkillBars items={skillBars} />
            </div>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardDescription>Results history</CardDescription>
              <CardTitle className="mt-2">Recent analyses</CardTitle>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {results.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="rounded-lg border border-border bg-background/50 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        <section className="space-y-6">
          <Card>
            <CardDescription>Job recommendations</CardDescription>
            <CardTitle className="mt-2">Top matches this week</CardTitle>
            <div className="mt-6 space-y-4">
              {opportunityCards.map((job) => (
                <div key={job.title} className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                    </div>
                    <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">{job.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardDescription>Roadmap timeline</CardDescription>
            <CardTitle className="mt-2">Recommended next steps</CardTitle>
            <div className="mt-6">
              <RoadmapTimeline items={roadmapItems} />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

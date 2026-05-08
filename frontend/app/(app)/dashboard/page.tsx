"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { dashboardStats as defaultStats, skillBars as defaultSkillBars, opportunityCards as defaultOpportunityCards, roadmapItems as defaultRoadmapItems } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { SkillBars } from "@/components/skill-bars";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { useResults } from "@/lib/results-context";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { runWorkflow, searchOpportunities } from "@/lib/api";

export default function DashboardPage() {
  const { latestResult, results } = useResults();
  const [opportunities, setOpportunities] = useState(() => defaultOpportunityCards);
  const [skills, setSkills] = useState(() => defaultSkillBars);
  const [roadmap, setRoadmap] = useState(() => defaultRoadmapItems);
  const [stats, setStats] = useState(() => defaultStats);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    // Fetch a lightweight workflow run to populate dashboard widgets.
    // This will attempt to use the backend; on failure we keep demo/mock data.
    let mounted = true;
    const fetchLive = async () => {
      setIsLoadingLive(true);
      try {
        const workflowPayload = {
          user_profile: {
            skills: ["Python", "FastAPI"],
            interests: ["Backend", "AI"],
            target_role: "Backend Engineer",
          },
          job_description: "Backend engineer role with Python, API design, PostgreSQL",
        };
        const wf = await runWorkflow(workflowPayload);
        const data = (wf && (wf.data ?? wf)) as any;
        const final = data.final_package ?? data;

        if (!mounted) return;

        // Opportunities may be an array of job objects
        if (final?.opportunities && Array.isArray(final.opportunities) && final.opportunities.length > 0) {
          setOpportunities(final.opportunities.map((o: any) => ({ title: o.title || o.position || o.job_title || 'Opportunity', company: o.company || o.employer || 'Unknown', location: o.location || 'Remote', score: Math.round((o.score || o.relevance || 0) * 100) })));
        } else {
          // try search endpoint as a fallback
          try {
            const searchResp = await searchOpportunities({ user_profile: workflowPayload.user_profile, query: "backend engineer" });
            const searchData = (searchResp && (searchResp.data ?? searchResp)) as any;
            if (mounted && Array.isArray(searchData)) {
              setOpportunities(searchData.map((h: any) => ({ title: h.payload?.title || h.payload?.name || 'Opportunity', company: h.payload?.company || 'Unknown', location: h.payload?.location || 'Remote', score: Math.round((h.score || 0) * 100) })));
            }
          } catch {
            // ignore
          }
        }

        // Skill analysis
        if (final?.skill_analysis && Array.isArray(final.skill_analysis.skills)) {
          setSkills(final.skill_analysis.skills.map((s: any) => ({ label: s.name || s.skill || 'Skill', value: Math.round((s.score || s.level || 0) * 100) })));
        }

        // Roadmap
        if (final?.mentor_guidance?.roadmap && Array.isArray(final.mentor_guidance.roadmap)) {
          setRoadmap(final.mentor_guidance.roadmap.map((r: any, idx: number) => ({ id: idx + 1, title: r.title || r.name || `Step ${idx + 1}`, note: r.note || r.description || '' })));
        }

        // Stats
        const newStats = [...defaultStats];
        const oppsStat = newStats.find(s => s.label === 'Opportunities');
        if (oppsStat && final?.opportunities?.length) {
          oppsStat.value = final.opportunities.length.toString();
        }
        const skillsStat = newStats.find(s => s.label === 'Skills');
        if (skillsStat && final?.skill_analysis?.skills?.length) {
          skillsStat.value = final.skill_analysis.skills.length.toString();
        }
        setStats(newStats);

      } catch (err) {
        // keep defaults if API fails
      } finally {
        if (mounted) setIsLoadingLive(false);
      }
    };
    fetchLive();
    return () => {
      mounted = false;
    };
  }, []);

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
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <Card>
            <CardDescription>Skill graph</CardDescription>
            <CardTitle className="mt-2">Your current profile strength</CardTitle>
            <div className="mt-6">
              <SkillBars items={skills} />
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
              {opportunities.map((job) => (
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
              <RoadmapTimeline items={roadmap} />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

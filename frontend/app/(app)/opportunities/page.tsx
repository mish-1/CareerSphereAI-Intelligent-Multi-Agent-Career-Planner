"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { searchOpportunities, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";
import { opportunityCards } from "@/lib/mock-data";

export default function OpportunitiesPage() {
  const { addResult } = useResults();
  const [output, setOutput] = useState<string>(JSON.stringify(opportunityCards, null, 2));
  const [status, setStatus] = useState("Search jobs and hackathons with semantic matching.");
  const [isPending, startTransition] = useTransition();

  const search = () => {
    startTransition(async () => {
      try {
        const response = await searchOpportunities({
          user_profile: {
            skills: ["Python", "FastAPI", "SQL"],
            interests: ["Backend", "AI"],
            target_role: "Backend Engineer",
          },
          query: "backend internship",
        });
        const opportunities = response.data || response;
        setOutput(JSON.stringify(opportunities, null, 2));
        setStatus("Opportunities loaded successfully.");
        
        // Save to results context
        addResult({
          type: "opportunities",
          title: "Job Opportunities Search",
          data: opportunities as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Opportunity search failed.";
        setStatus(message);
        
        // Save error to results context
        addResult({
          type: "opportunities",
          title: "Opportunity Search Error",
          data: {},
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <CardDescription>Recommendation engine</CardDescription>
        <CardTitle>Opportunity matching</CardTitle>
        <Button onClick={search} disabled={isPending} className="w-full">
          {isPending ? "Searching..." : "Fetch matches"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
        <div className="space-y-3">
          {opportunityCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold">{card.title}</h4>
                  <p className="text-sm text-muted-foreground">{card.company} · {card.location}</p>
                </div>
                <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">{card.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <CardDescription>Explainability</CardDescription>
        <CardTitle>Why these recommendations?</CardTitle>
        <Textarea value={output} readOnly className="min-h-[32rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

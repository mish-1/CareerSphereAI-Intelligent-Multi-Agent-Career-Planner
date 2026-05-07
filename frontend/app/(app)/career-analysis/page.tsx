"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { runWorkflow, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

const sampleProfile = {
  user_profile: {
    name: "Aarav Sharma",
    skills: ["Python", "FastAPI", "SQL"],
    interests: ["Backend", "AI"],
    resume_text: "Built a Java project. Worked on APIs.",
    target_role: "Backend Engineer",
  },
  job_description: "Backend engineer role with Python, API design, PostgreSQL, and cloud deployment",
  company_name: "InnovaSoft",
  company_reviews: ["Supportive engineering culture", "Good work-life balance"],
};

export default function CareerAnalysisPage() {
  const { addResult } = useResults();
  const [output, setOutput] = useState<string>(JSON.stringify(sampleProfile, null, 2));
  const [status, setStatus] = useState("Run the full workflow to see multi-agent output.");
  const [isPending, startTransition] = useTransition();

  const analyze = () => {
    startTransition(async () => {
      try {
        const response = await runWorkflow(sampleProfile);
        const workflowData = response.data || response;
        setOutput(JSON.stringify(workflowData, null, 2));
        setStatus("Workflow completed successfully.");
        
        // Save to results context
        addResult({
          type: "workflow",
          title: "Career Analysis Workflow",
          data: workflowData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Workflow failed.";
        setStatus(message);
        
        // Save error to results context
        addResult({
          type: "workflow",
          title: "Career Analysis Error",
          data: sampleProfile as Record<string, unknown>,
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-4">
        <CardDescription>Orchestrator</CardDescription>
        <CardTitle>Multi-agent career analysis</CardTitle>
        <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[26rem] font-mono text-xs" />
        <Button onClick={analyze} disabled={isPending} className="w-full">
          {isPending ? "Analyzing..." : "Run workflow"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4">
        <CardDescription>Final package</CardDescription>
        <CardTitle>Orchestrated agent output</CardTitle>
        <Textarea value={output} readOnly className="min-h-[34rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

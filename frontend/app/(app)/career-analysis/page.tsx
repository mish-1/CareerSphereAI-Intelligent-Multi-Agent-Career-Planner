"use client";

import { useState, useTransition, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, runWorkflow, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function CareerAnalysisPage() {
  const { addResult } = useResults();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyReviews, setCompanyReviews] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState("Fill in the details below to run a new analysis.");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profileData = response.data || response;
        setUserProfile(profileData);
      } catch (error) {
        setStatus("Failed to load user profile. Please try again later.");
      }
    };
    fetchProfile();
  }, []);

  const analyze = () => {
    if (!userProfile) {
      setStatus("User profile is not loaded yet. Please wait.");
      return;
    }

    startTransition(async () => {
      const payload = {
        user_profile: {
          ...userProfile,
          // Ensure resume_text is included if available
          resume_text: userProfile.resume_text || "",
        },
        job_description: jobDescription,
        company_name: companyName,
        company_reviews: companyReviews.split("\\n").filter(Boolean),
      };

      try {
        setOutput(JSON.stringify(payload, null, 2));
        setStatus("Running workflow...");
        const response = await runWorkflow(payload);
        const workflowData = response.data || response;
        setOutput(JSON.stringify(workflowData, null, 2));
        setStatus("Workflow completed successfully.");

        addResult({
          type: "workflow",
          title: "Career Analysis Workflow",
          data: workflowData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Workflow failed.";
        setStatus(message);

        addResult({
          type: "workflow",
          title: "Career Analysis Error",
          data: payload as Record<string, unknown>,
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-4 p-6">
        <CardDescription>Orchestrator</CardDescription>
        <CardTitle>Multi-agent career analysis</CardTitle>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-desc">Job Description</Label>
            <Textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-[10rem]"
            />
          </div>
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., InnovaSoft"
            />
          </div>
          <div>
            <Label htmlFor="company-reviews">Company Reviews</Label>
            <Textarea
              id="company-reviews"
              value={companyReviews}
              onChange={(e) => setCompanyReviews(e.target.value)}
              placeholder="Paste any relevant company reviews here (one per line)..."
              className="min-h-[6rem]"
            />
          </div>
        </div>

        <Button onClick={analyze} disabled={isPending || !userProfile} className="w-full">
          {isPending ? "Analyzing..." : "Run workflow"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4 p-6">
        <CardDescription>Final package</CardDescription>
        <CardTitle>Orchestrated agent output</CardTitle>
        <Textarea value={output} readOnly className="min-h-[34rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

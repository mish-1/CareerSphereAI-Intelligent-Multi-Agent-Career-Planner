"use client";

import { useState, useTransition, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, optimizeResume, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function ResumeOptimizerPage() {
  const { addResult } = useResults();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [output, setOutput] = useState<string>("Optimized resume output appears here.");
  const [status, setStatus] = useState("Loading profile...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileResponse = await getProfile();
        const profile = profileResponse.data || profileResponse;
        setUserProfile(profile);
        setResumeText(profile.resume_text || "");
        setStatus("Profile loaded. Ready to optimize.");
      } catch (error) {
        setStatus("Failed to load user profile. Please try again later.");
      }
    };
    fetchInitialData();
  }, []);

  const optimize = () => {
    if (!userProfile) {
      setStatus("User profile not loaded yet.");
      return;
    }
    startTransition(async () => {
      setStatus("Optimizing resume...");
      try {
        const response = await optimizeResume({
          resume_text: resumeText,
          job_description: jobDescription,
          target_role: userProfile.target_role || "Software Engineer",
        });
        const optimizedData = response.data || response;
        setOutput(JSON.stringify(optimizedData, null, 2));
        setStatus("Resume optimized successfully.");

        addResult({
          type: "resume-optimize",
          title: "Resume Optimization",
          data: optimizedData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Resume optimization failed.";
        setStatus(message);

        addResult({
          type: "resume-optimize",
          title: "Resume Optimization Error",
          data: { resume_text: resumeText, job_description: jobDescription },
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="space-y-4 p-6">
        <CardDescription>Input</CardDescription>
        <CardTitle>Rewrite a resume for ATS</CardTitle>
        <Textarea
          placeholder="Your resume text will be loaded here..."
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          className="min-h-[10rem]"
          disabled={!userProfile}
        />
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          className="min-h-[10rem]"
        />
        <Button onClick={optimize} disabled={isPending || !userProfile || !jobDescription} className="w-full">
          {isPending ? "Optimizing..." : "Optimize resume"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4 p-6">
        <CardDescription>Output</CardDescription>
        <CardTitle>ATS score and exports</CardTitle>
        <Textarea value={output} readOnly className="min-h-[34rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

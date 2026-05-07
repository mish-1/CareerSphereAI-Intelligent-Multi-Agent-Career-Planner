"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { optimizeResume, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function ResumeOptimizerPage() {
  const { addResult } = useResults();
  const [resumeText, setResumeText] = useState("Built a Java project");
  const [jobDescription, setJobDescription] = useState("Backend engineer role with Python, FastAPI, PostgreSQL, and cloud deployment.");
  const [output, setOutput] = useState<string>("Optimized resume output appears here.");
  const [status, setStatus] = useState("Optimize a resume for a target job description.");
  const [isPending, startTransition] = useTransition();

  const optimize = () => {
    startTransition(async () => {
      try {
        const response = await optimizeResume({ 
          resume_text: resumeText, 
          job_description: jobDescription, 
          target_role: "Backend Engineer" 
        });
        const optimizedData = response.data || response;
        setOutput(JSON.stringify(optimizedData, null, 2));
        setStatus("Resume optimized successfully.");
        
        // Save to results context
        addResult({
          type: "resume-optimize",
          title: "Resume Optimization",
          data: optimizedData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Resume optimization failed.";
        setStatus(message);
        
        // Save error to results context
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
      <Card className="space-y-4">
        <CardDescription>Input</CardDescription>
        <CardTitle>Rewrite a resume for ATS</CardTitle>
        <Textarea 
          placeholder="Paste your resume text here..."
          value={resumeText} 
          onChange={(event) => setResumeText(event.target.value)} 
          className="min-h-[10rem]"
        />
        <Textarea 
          placeholder="Paste the job description here..."
          value={jobDescription} 
          onChange={(event) => setJobDescription(event.target.value)}
          className="min-h-[10rem]"
        />
        <Button onClick={optimize} disabled={isPending} className="w-full">
          {isPending ? "Optimizing..." : "Optimize resume"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4">
        <CardDescription>Output</CardDescription>
        <CardTitle>ATS score and exports</CardTitle>
        <Textarea value={output} readOnly className="min-h-[34rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

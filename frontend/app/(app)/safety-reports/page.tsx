"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkSafety, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function SafetyReportsPage() {
  const { addResult } = useResults();
  const [companyName, setCompanyName] = useState("");
  const [companyReviews, setCompanyReviews] = useState("");
  const [output, setOutput] = useState<string>("Run a workplace safety assessment on a potential employer.");
  const [status, setStatus] = useState("Enter a company name and some reviews to generate a safety report.");
  const [isPending, startTransition] = useTransition();

  const evaluate = () => {
    startTransition(async () => {
      setStatus("Generating safety report...");
      try {
        const response = await checkSafety({
          company_name: companyName,
          company_reviews: companyReviews.split('\n'), // Simple split by newline
        });
        const safetyData = response.data || response;
        setOutput(JSON.stringify(safetyData, null, 2));
        setStatus("Safety report generated successfully.");

        addResult({
          type: "safety-check",
          title: `Workplace Safety Assessment: ${companyName}`,
          data: safetyData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Safety report generation failed.";
        setStatus(message);

        addResult({
          type: "safety-check",
          title: "Safety Assessment Error",
          data: { company_name: companyName },
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-4 p-6">
        <CardDescription>Safety agent</CardDescription>
        <CardTitle>Workplace risk analysis</CardTitle>
        
        <Input 
          placeholder="Enter company name..."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Textarea 
          placeholder="Paste company reviews here, one per line..."
          value={companyReviews}
          onChange={(e) => setCompanyReviews(e.target.value)}
          className="min-h-[10rem]"
        />

        <Button onClick={evaluate} disabled={isPending || !companyName || !companyReviews} className="w-full">
          {isPending ? "Evaluating..." : "Generate safety report"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4 p-6">
        <CardDescription>Detailed report</CardDescription>
        <CardTitle>Safety score and concerns</CardTitle>
        <Textarea value={output} readOnly className="min-h-[32rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

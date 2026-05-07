"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { checkSafety, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function SafetyReportsPage() {
  const { addResult } = useResults();
  const [output, setOutput] = useState<string>("Run a workplace safety assessment.");
  const [status, setStatus] = useState("Safety insights will show score, concerns, and balance signals.");
  const [isPending, startTransition] = useTransition();

  const evaluate = () => {
    startTransition(async () => {
      try {
        const response = await checkSafety({
          company_name: "InnovaSoft",
          company_reviews: ["Supportive team", "Reasonable hours", "Inclusive culture"],
        });
        const safetyData = response.data || response;
        setOutput(JSON.stringify(safetyData, null, 2));
        setStatus("Safety report loaded successfully.");
        
        // Save to results context
        addResult({
          type: "safety-check",
          title: "Workplace Safety Assessment",
          data: safetyData as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Safety request failed.";
        setStatus(message);
        
        // Save error to results context
        addResult({
          type: "safety-check",
          title: "Safety Assessment Error",
          data: { company_name: "InnovaSoft" },
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-4">
        <CardDescription>Safety agent</CardDescription>
        <CardTitle>Workplace risk analysis</CardTitle>
        <Button onClick={evaluate} disabled={isPending} className="w-full">
          {isPending ? "Evaluating..." : "Generate safety report"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4">
        <CardDescription>Detailed report</CardDescription>
        <CardTitle>Safety score and concerns</CardTitle>
        <Textarea value={output} readOnly className="min-h-[32rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

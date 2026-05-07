"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadResume, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

export default function ResumeUploadPage() {
  const { addResult } = useResults();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [status, setStatus] = useState<string>("Upload a PDF, DOCX, or text resume.");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpload = () => {
    if (!file) {
      setStatus("Choose a file before uploading.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await uploadResume(file, targetRole || undefined);
        const data = response.data || response;
        setResult(data as Record<string, unknown>);
        setStatus("Resume parsed successfully.");
        
        // Save to results context
        addResult({
          type: "resume-upload",
          title: `Resume: ${file.name}`,
          data: data as Record<string, unknown>,
        });
      } catch (error) {
        const apiError = error as ApiError | Error;
        const message = "message" in apiError ? apiError.message : "Upload failed.";
        setStatus(message);
        
        // Save error to results context
        addResult({
          type: "resume-upload",
          title: `Resume Upload Error: ${file.name}`,
          data: { file: file.name },
          error: message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="space-y-4">
        <CardDescription>Resume pipeline</CardDescription>
        <CardTitle>Upload a resume</CardTitle>
        <Input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <Input placeholder="Target role (optional)" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
        <Button onClick={handleUpload} disabled={isPending} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          {isPending ? "Uploading..." : "Upload and parse"}
        </Button>
        <p className="text-sm text-muted-foreground">{status}</p>
      </Card>

      <Card className="space-y-4">
        <CardDescription>Parsed output</CardDescription>
        <CardTitle>Extracted resume text and metadata</CardTitle>
        <Textarea readOnly value={JSON.stringify(result ?? {}, null, 2)} className="min-h-[28rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

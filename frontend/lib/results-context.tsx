"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface WorkflowResult {
  id: string;
  timestamp: number;
  type: "workflow" | "resume-upload" | "resume-optimize" | "opportunities" | "safety-check";
  title: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface ResultsContextType {
  results: WorkflowResult[];
  latestResult: WorkflowResult | null;
  addResult: (result: Omit<WorkflowResult, "id" | "timestamp">) => void;
  clearResults: () => void;
  removeResult: (id: string) => void;
  getResultsByType: (type: WorkflowResult["type"]) => WorkflowResult[];
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

const STORAGE_KEY = "careersphere_results";
const MAX_RESULTS = 50;

export function ResultsProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<WorkflowResult[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkflowResult[];
        setResults(parsed);
      }
    } catch (error) {
      console.error("Failed to load results from localStorage:", error);
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever results change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (error) {
      console.error("Failed to save results to localStorage:", error);
    }
  }, [results, mounted]);

  const addResult = useCallback((result: Omit<WorkflowResult, "id" | "timestamp">) => {
    setResults((prev) => {
      const newResult: WorkflowResult = {
        ...result,
        id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      const updated = [newResult, ...prev].slice(0, MAX_RESULTS);
      return updated;
    });
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const removeResult = useCallback((id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getResultsByType = useCallback(
    (type: WorkflowResult["type"]) => {
      return results.filter((r) => r.type === type);
    },
    [results]
  );

  const latestResult = results[0] || null;

  return (
    <ResultsContext.Provider
      value={{
        results,
        latestResult,
        addResult,
        clearResults,
        removeResult,
        getResultsByType,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
}

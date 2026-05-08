"use client";

import { useState, useTransition, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getProfile, searchOpportunities, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  payload: Record<string, any>;
};

export default function OpportunitiesPage() {
  const { addResult } = useResults();
  const [query, setQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState("Loading profile...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileResponse = await getProfile();
        const profile = profileResponse.data || profileResponse;
        setUserProfile(profile);
        setQuery(profile.target_role || "backend engineer");
        setStatus("Profile loaded. Ready to search.");
        
        // Automatically run a search with the user's target role
        startTransition(() => search(profile, profile.target_role || "backend engineer"));

      } catch (error) {
        setStatus("Failed to load user profile. Please try again later.");
      }
    };
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (!userProfile) {
      setStatus("User profile not loaded yet.");
      return;
    }
    startTransition(() => search(userProfile, query));
  };

  const search = async (profile: any, searchQuery: string) => {
    setStatus("Searching for opportunities...");
    try {
      const response = await searchOpportunities({
        user_profile: profile,
        query: searchQuery,
      });
      const searchData = response.data || response;
      
      const newOpportunities = (searchData || []).map((hit: any) => ({
        id: hit.id,
        title: hit.payload?.title || hit.payload?.name || 'Opportunity',
        company: hit.payload?.company || 'Unknown',
        location: hit.payload?.location || 'Remote',
        score: Math.round((hit.score || 0) * 100),
        payload: hit.payload,
      }));

      setOpportunities(newOpportunities);
      setOutput(JSON.stringify(searchData, null, 2));
      setStatus(`Found ${newOpportunities.length} opportunities.`);
      
      addResult({
        type: "opportunities",
        title: `Opportunity Search: "${searchQuery}"`,
        data: searchData as Record<string, unknown>,
      });
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message = "message" in apiError ? apiError.message : "Opportunity search failed.";
      setStatus(message);
      
      addResult({
        type: "opportunities",
        title: "Opportunity Search Error",
        data: { query: searchQuery },
        error: message,
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4 p-6">
        <CardDescription>Recommendation engine</CardDescription>
        <CardTitle>Opportunity matching</CardTitle>
        
        <div className="flex w-full items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Enter a job title, skill, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isPending || !userProfile}>
            {isPending ? "Searching..." : "Search"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{status}</p>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {opportunities.map((card) => (
            <div key={card.id} className="rounded-2xl border border-border bg-background/70 p-4">
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

      <Card className="space-y-4 p-6">
        <CardDescription>Vector search results</CardDescription>
        <CardTitle>Raw search output</CardTitle>
        <Textarea value={output} readOnly className="min-h-[32rem] font-mono text-xs" />
      </Card>
    </div>
  );
}

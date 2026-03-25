import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DebatePoint {
  title: string;
  description: string;
  url: string;
  source: string;
  side: "for" | "against";
  keyPoints: string[];
  excerpt: string;
}

export function useDebateResearch() {
  const [forPoints, setForPoints] = useState<DebatePoint[]>([]);
  const [againstPoints, setAgainstPoints] = useState<DebatePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");

  const fetchDebatePoints = useCallback(async (debateTopic: string) => {
    if (!debateTopic.trim()) return;
    setIsLoading(true);
    setTopic(debateTopic);

    try {
      const [forRes, againstRes] = await Promise.all([
        supabase.functions.invoke("search-web", {
          body: { query: `arguments supporting "${debateTopic}" evidence facts data`, extractPoints: true },
        }),
        supabase.functions.invoke("search-web", {
          body: { query: `arguments against "${debateTopic}" criticism counterpoints evidence`, extractPoints: true },
        }),
      ]);

      if (!forRes.error && forRes.data?.results) {
        setForPoints(
          forRes.data.results.map((r: any) => ({
            title: r.title,
            description: r.description,
            url: r.url,
            source: r.source,
            side: "for" as const,
            keyPoints: r.keyPoints || [],
            excerpt: r.excerpt || "",
          }))
        );
      }

      if (!againstRes.error && againstRes.data?.results) {
        setAgainstPoints(
          againstRes.data.results.map((r: any) => ({
            title: r.title,
            description: r.description,
            url: r.url,
            source: r.source,
            side: "against" as const,
            keyPoints: r.keyPoints || [],
            excerpt: r.excerpt || "",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch debate points:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { forPoints, againstPoints, isLoading, topic, fetchDebatePoints };
}

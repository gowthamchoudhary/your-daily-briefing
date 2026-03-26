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

function cleanKeyPoints(points: string[]): string[] {
  return points.filter((p) => {
    if (!p || p.length < 15 || p.length > 400) return false;
    // Filter out social media links, nav items, and junk
    if (/^\[.*\]\(https?:\/\/(twitter|facebook|linkedin|youtube|bsky)/.test(p)) return false;
    if (/^(Skip to|Search|Menu|Home|About|Contact)/i.test(p)) return false;
    return true;
  });
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
    setForPoints([]);
    setAgainstPoints([]);

    try {
      const [forRes, againstRes] = await Promise.all([
        supabase.functions.invoke("search-web", {
          body: { query: `arguments supporting "${debateTopic}" evidence facts data`, extractPoints: true },
        }),
        supabase.functions.invoke("search-web", {
          body: { query: `arguments against "${debateTopic}" criticism counterpoints evidence`, extractPoints: true },
        }),
      ]);

      console.log("Debate research FOR response:", forRes);
      console.log("Debate research AGAINST response:", againstRes);

      if (!forRes.error && forRes.data?.results) {
        setForPoints(
          forRes.data.results.map((r: any) => ({
            title: r.title || "Untitled",
            description: r.description || "",
            url: r.url || "",
            source: r.source || "Unknown",
            side: "for" as const,
            keyPoints: cleanKeyPoints(r.keyPoints || []),
            excerpt: r.excerpt || "",
          }))
        );
      } else {
        console.error("FOR points error:", forRes.error);
      }

      if (!againstRes.error && againstRes.data?.results) {
        setAgainstPoints(
          againstRes.data.results.map((r: any) => ({
            title: r.title || "Untitled",
            description: r.description || "",
            url: r.url || "",
            source: r.source || "Unknown",
            side: "against" as const,
            keyPoints: cleanKeyPoints(r.keyPoints || []),
            excerpt: r.excerpt || "",
          }))
        );
      } else {
        console.error("AGAINST points error:", againstRes.error);
      }
    } catch (err) {
      console.error("Failed to fetch debate points:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { forPoints, againstPoints, isLoading, topic, fetchDebatePoints };
}

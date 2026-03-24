import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NewsCardData } from "@/components/NewsCard";

export type ContentCategory = "news" | "memes" | "videos" | "official" | "social";

const CATEGORY_QUERY_MAP: Record<ContentCategory, (interests: string[]) => string> = {
  news: (i) => `Latest breaking news: ${i.join(", ")}`,
  memes: (i) => `Funny memes trending about ${i.join(", ")} site:reddit.com OR site:twitter.com OR site:x.com`,
  videos: (i) => `Latest viral videos about ${i.join(", ")} site:youtube.com OR site:tiktok.com`,
  official: (i) => `Official announcements updates ${i.join(", ")} site:gov OR site:reuters.com OR site:bbc.com`,
  social: (i) => `Trending reactions opinions ${i.join(", ")} site:twitter.com OR site:reddit.com OR site:x.com`,
};

export function useNewsLoader() {
  const [cards, setCards] = useState<NewsCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ContentCategory>("news");

  const interests = JSON.parse(
    localStorage.getItem("companion_interests") || "[]"
  ) as string[];

  const fetchCategory = useCallback(async (category: ContentCategory) => {
    if (interests.length === 0) return;

    setIsLoading(true);
    setActiveCategory(category);

    const query = CATEGORY_QUERY_MAP[category](interests);

    try {
      const { data, error } = await supabase.functions.invoke("search-web", {
        body: { query },
      });

      if (!error && data?.results) {
        const newCards: NewsCardData[] = data.results.map((r: any) => ({
          title: r.title,
          description: r.description,
          url: r.url,
          source: r.source,
          image: r.image,
          type: category === "social" || category === "memes" ? "social" : "news",
        }));
        setCards(newCards);
      }
    } catch (err) {
      console.error("Failed to fetch category:", err);
    } finally {
      setIsLoading(false);
    }
  }, [interests]);

  // Auto-load news on mount
  useEffect(() => {
    fetchCategory("news");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { cards, setCards, isLoading, activeCategory, fetchCategory };
}

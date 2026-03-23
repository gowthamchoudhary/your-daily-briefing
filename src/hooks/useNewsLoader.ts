import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NewsCardData } from "@/components/NewsCard";

export function useNewsLoader() {
  const [initialCards, setInitialCards] = useState<NewsCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interests = JSON.parse(
      localStorage.getItem("companion_interests") || "[]"
    ) as string[];

    if (interests.length === 0) {
      setIsLoading(false);
      return;
    }

    const query = `Latest news: ${interests.join(", ")}`;

    supabase.functions
      .invoke("search-web", { body: { query } })
      .then(({ data, error }) => {
        if (!error && data?.results) {
          const cards: NewsCardData[] = data.results.map((r: any) => ({
            title: r.title,
            description: r.description,
            url: r.url,
            source: r.source,
            image: r.image,
          }));
          setInitialCards(cards);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { initialCards, isLoading };
}

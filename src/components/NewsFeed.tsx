import { AnimatePresence, motion } from "framer-motion";
import ContentCategoryBar from "@/components/ContentCategoryBar";
import NewsCard, { type NewsCardData } from "@/components/NewsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ContentCategory } from "@/hooks/useNewsLoader";
import { Loader2 } from "lucide-react";

interface NewsFeedProps {
  cards: NewsCardData[];
  isLoading: boolean;
  activeCategory: ContentCategory;
  onCategorySelect: (category: ContentCategory) => void;
}

const NewsFeed = ({ cards, isLoading, activeCategory, onCategorySelect }: NewsFeedProps) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sticky category bar */}
      <div className="px-4 py-2 border-b border-border/20 bg-background/80 backdrop-blur-md">
        <ContentCategoryBar
          active={activeCategory}
          onSelect={onCategorySelect}
          isLoading={isLoading}
        />
      </div>

      {/* Scrollable cards */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Fetching {activeCategory}...</p>
            </div>
          ) : cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-2"
            >
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/60">Try another category</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {cards.map((card, i) => (
                <NewsCard key={`${activeCategory}-${card.url}-${i}`} card={card} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NewsFeed;

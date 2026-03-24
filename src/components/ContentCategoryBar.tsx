import { motion } from "framer-motion";
import { Newspaper, Laugh, Video, Shield, MessageCircle } from "lucide-react";
import type { ContentCategory } from "@/hooks/useNewsLoader";

const CATEGORIES: { id: ContentCategory; label: string; icon: React.ElementType }[] = [
  { id: "news", label: "Latest", icon: Newspaper },
  { id: "memes", label: "Memes", icon: Laugh },
  { id: "videos", label: "Videos", icon: Video },
  { id: "official", label: "Official", icon: Shield },
  { id: "social", label: "Social", icon: MessageCircle },
];

interface ContentCategoryBarProps {
  active: ContentCategory;
  onSelect: (category: ContentCategory) => void;
  isLoading: boolean;
}

const ContentCategoryBar = ({ active, onSelect, isLoading }: ContentCategoryBarProps) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(id)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/40 disabled:opacity-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ContentCategoryBar;

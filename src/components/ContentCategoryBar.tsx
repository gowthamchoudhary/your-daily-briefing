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
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(id)}
            disabled={isLoading}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
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

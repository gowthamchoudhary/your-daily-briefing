import { motion } from "framer-motion";
import { ExternalLink, MessageCircle } from "lucide-react";

export interface NewsCardData {
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  type?: "news" | "social";
}

interface NewsCardProps {
  card: NewsCardData;
  index: number;
}

const NewsCard = ({ card, index }: NewsCardProps) => {
  const isSocial = card.type === "social";

  return (
    <motion.a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className={`block glass-card overflow-hidden hover:border-primary/40 transition-colors group ${
        isSocial ? "border-l-2 border-l-accent" : ""
      }`}
    >
      {card.image && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {isSocial ? (
              <MessageCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            ) : null}
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {card.source}
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
        <h3 className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2">
          {card.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {card.description}
        </p>
      </div>
    </motion.a>
  );
};

export default NewsCard;

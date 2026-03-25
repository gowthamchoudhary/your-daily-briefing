import { motion } from "framer-motion";
import { ExternalLink, MessageCircle, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleDebate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Store debate topic and navigate
    localStorage.setItem("debate_prefill_topic", card.title);
    navigate("/debate");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden bg-card/80 border border-border/40 hover:border-primary/30 transition-all duration-200 group"
    >
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block active:scale-[0.98]"
      >
        <div className="flex gap-3 p-3">
          {card.image && (
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-secondary/50">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="text-[13px] font-semibold leading-tight line-clamp-2 text-foreground mb-1">
                {card.title}
              </h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1.5">
                {isSocial && <MessageCircle className="w-3 h-3 text-accent" />}
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  {card.source}
                </span>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </a>

      {/* Debate this button */}
      <button
        onClick={handleDebate}
        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border/20 text-[10px] font-bold uppercase tracking-wider text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all"
      >
        <Swords className="w-3 h-3" />
        Debate this
      </button>
    </motion.div>
  );
};

export default NewsCard;

import { motion } from "framer-motion";
import { ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";
import type { DebatePoint } from "@/hooks/useDebateResearch";

interface DebatePointCardProps {
  point: DebatePoint;
  index: number;
}

const DebatePointCard = ({ point, index }: DebatePointCardProps) => {
  const isFor = point.side === "for";

  return (
    <motion.a
      href={point.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: isFor ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={`block p-3 rounded-xl border transition-all group hover:scale-[1.01] active:scale-[0.99] ${
        isFor
          ? "border-green-500/20 bg-green-500/5 hover:border-green-500/40"
          : "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          isFor ? "bg-green-500/20" : "bg-red-500/20"
        }`}>
          {isFor ? (
            <ThumbsUp className="w-3 h-3 text-green-400" />
          ) : (
            <ThumbsDown className="w-3 h-3 text-red-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] font-semibold leading-tight line-clamp-2 text-foreground mb-0.5">
            {point.title}
          </h4>
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {point.description}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              {point.source}
            </span>
            <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </motion.a>
  );
};

export default DebatePointCard;

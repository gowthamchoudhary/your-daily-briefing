import { motion } from "framer-motion";
import { ExternalLink, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { DebatePoint } from "@/hooks/useDebateResearch";

interface DebatePointCardProps {
  point: DebatePoint;
  index: number;
}

const DebatePointCard = ({ point, index }: DebatePointCardProps) => {
  const isFor = point.side === "for";
  const [expanded, setExpanded] = useState(false);
  const hasPoints = point.keyPoints && point.keyPoints.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isFor ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={`rounded-xl border transition-all ${
        isFor
          ? "border-green-500/20 bg-green-500/5"
          : "border-destructive/20 bg-destructive/5"
      }`}
    >
      {/* Header - clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3"
      >
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
            isFor ? "bg-green-500/20" : "bg-destructive/20"
          }`}>
            {isFor ? (
              <ThumbsUp className="w-3 h-3 text-green-400" />
            ) : (
              <ThumbsDown className="w-3 h-3 text-destructive" />
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
              <div className="flex items-center gap-1">
                {hasPoints && (
                  <span className="text-[9px] text-muted-foreground/50">
                    {point.keyPoints.length} points
                  </span>
                )}
                {hasPoints ? (
                  expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground/40" /> : <ChevronDown className="w-3 h-3 text-muted-foreground/40" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded key points */}
      {expanded && hasPoints && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3 border-t border-border/10"
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mt-2 mb-1.5">
            💡 Use these points
          </p>
          <ul className="space-y-1.5">
            {point.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${
                  isFor ? "bg-green-400" : "bg-destructive"
                }`} />
                <span className="text-[10px] text-foreground/80 leading-relaxed">
                  {kp}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={point.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Read full source
          </a>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DebatePointCard;

import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Shield, Swords } from "lucide-react";
import DebatePointCard from "./DebatePointCard";
import type { DebatePoint } from "@/hooks/useDebateResearch";
import { useState } from "react";

interface DebateAssistantPanelProps {
  forPoints: DebatePoint[];
  againstPoints: DebatePoint[];
  isLoading: boolean;
  topic: string;
}

const DebateAssistantPanel = ({ forPoints, againstPoints, isLoading, topic }: DebateAssistantPanelProps) => {
  const [activeTab, setActiveTab] = useState<"for" | "against">("for");
  const points = activeTab === "for" ? forPoints : againstPoints;

  return (
    <div className="flex flex-col h-full">
      {/* Topic header */}
      {topic && (
        <div className="px-4 py-2 border-b border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Debating</p>
          <p className="text-sm font-semibold text-foreground truncate">{topic}</p>
        </div>
      )}

      {/* For / Against tabs */}
      <div className="flex border-b border-border/20">
        <button
          onClick={() => setActiveTab("for")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
            activeTab === "for"
              ? "text-green-400 border-b-2 border-green-400 bg-green-500/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Supporting ({forPoints.length})
        </button>
        <button
          onClick={() => setActiveTab("against")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
            activeTab === "against"
              ? "text-red-400 border-b-2 border-red-400 bg-red-500/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Opposing ({againstPoints.length})
        </button>
      </div>

      {/* Points list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-[10px] text-muted-foreground">Researching points...</p>
            </div>
          ) : points.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-2 text-center"
            >
              <p className="text-xs text-muted-foreground">
                {topic ? "No points found" : "Start a debate to see research"}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Mention a topic and points will appear here
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {points.map((point, i) => (
                <DebatePointCard key={`${point.url}-${i}`} point={point} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DebateAssistantPanel;

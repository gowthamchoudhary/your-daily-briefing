import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DebateScoreBoardProps {
  userScore: number;
  aiScore: number;
  userName: string;
}

const DebateScoreBoard = ({ userScore, aiScore, userName }: DebateScoreBoardProps) => {
  const total = userScore + aiScore || 1;
  const userPct = Math.round((userScore / total) * 100);
  const aiPct = 100 - userPct;

  const trend = userScore > aiScore ? "winning" : userScore < aiScore ? "losing" : "tied";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Debate Score
        </h3>
        <div className="flex items-center gap-1">
          {trend === "winning" ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          ) : trend === "losing" ? (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className={`text-[10px] font-medium ${
            trend === "winning" ? "text-green-400" : trend === "losing" ? "text-red-400" : "text-muted-foreground"
          }`}>
            {trend === "winning" ? "You're ahead!" : trend === "losing" ? "AI leads" : "It's a tie"}
          </span>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{userName}</span>
          <span className="font-bold text-primary">{userScore}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${userPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">AI Opponent</span>
          <span className="font-bold text-destructive">{aiScore}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-destructive/80 to-destructive"
            initial={{ width: 0 }}
            animate={{ width: `${aiPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Round indicator */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((round) => (
          <div
            key={round}
            className={`w-2 h-2 rounded-full transition-colors ${
              round <= Math.floor((userScore + aiScore) / 2 + 1)
                ? "bg-primary"
                : "bg-secondary"
            }`}
          />
        ))}
        <span className="text-[9px] text-muted-foreground ml-1">Rounds</span>
      </div>
    </div>
  );
};

export default DebateScoreBoard;

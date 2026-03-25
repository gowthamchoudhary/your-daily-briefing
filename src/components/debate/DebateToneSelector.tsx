import { motion } from "framer-motion";
import { Smile, Flame, Brain, Laugh, Zap, Heart } from "lucide-react";

export type DebateTone = "calm" | "soft" | "aggressive" | "funny" | "roasting" | "professor";

const TONES: { id: DebateTone; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { id: "calm", label: "Calm", icon: Heart, color: "from-blue-500/20 to-cyan-500/20", desc: "Measured & thoughtful" },
  { id: "soft", label: "Soft", icon: Smile, color: "from-green-500/20 to-emerald-500/20", desc: "Gentle & persuasive" },
  { id: "aggressive", label: "Aggressive", icon: Flame, color: "from-red-500/20 to-orange-500/20", desc: "Hard-hitting & direct" },
  { id: "funny", label: "Funny", icon: Laugh, color: "from-yellow-500/20 to-amber-500/20", desc: "Witty & humorous" },
  { id: "roasting", label: "Roasting", icon: Zap, color: "from-pink-500/20 to-rose-500/20", desc: "Savage burns 🔥" },
  { id: "professor", label: "Professor", icon: Brain, color: "from-purple-500/20 to-violet-500/20", desc: "Academic & factual" },
];

interface DebateToneSelectorProps {
  selected: DebateTone;
  onSelect: (tone: DebateTone) => void;
  disabled?: boolean;
}

const DebateToneSelector = ({ selected, onSelect, disabled }: DebateToneSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TONES.map(({ id, label, icon: Icon, color, desc }) => {
        const isActive = selected === id;
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(id)}
            disabled={disabled}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
              isActive
                ? `border-primary bg-gradient-to-br ${color} shadow-lg shadow-primary/10`
                : "border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:border-border"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            <span className="text-[9px] text-muted-foreground/70 leading-tight">{desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DebateToneSelector;

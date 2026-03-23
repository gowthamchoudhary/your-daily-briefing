import { motion } from "framer-motion";

interface ConversationOrbProps {
  isSpeaking: boolean;
  status: string;
}

const ConversationOrb = ({ isSpeaking, status }: ConversationOrbProps) => {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-56 h-56 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(var(--orb-glow) / 0.15) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.3, 1] : [1, 1.08, 1],
          opacity: isSpeaking ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isSpeaking ? 0.8 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-44 h-44 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(var(--orb-secondary) / 0.12) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isSpeaking ? [1.1, 0.9, 1.1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isSpeaking ? 0.6 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Core orb */}
      <motion.div
        className={`w-32 h-32 rounded-full ${
          isSpeaking ? "orb-glow-speaking" : isConnected ? "orb-glow" : ""
        }`}
        style={{
          background: isConnecting
            ? `conic-gradient(from 0deg, hsl(var(--orb-glow) / 0.5), hsl(var(--orb-secondary) / 0.5), hsl(var(--orb-glow) / 0.5))`
            : `radial-gradient(circle at 35% 35%, hsl(var(--orb-glow) / 0.9), hsl(var(--orb-secondary) / 0.6) 60%, hsl(var(--primary) / 0.3))`,
        }}
        animate={
          isConnecting
            ? { rotate: 360 }
            : {
                scale: isSpeaking ? [1, 1.08, 0.96, 1.04, 1] : [1, 1.02, 1],
              }
        }
        transition={
          isConnecting
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : {
                duration: isSpeaking ? 0.5 : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* Status dot */}
      <div className="absolute -bottom-1 -right-1">
        <div
          className={`w-4 h-4 rounded-full border-2 border-background ${
            isConnected
              ? "bg-green-500"
              : isConnecting
              ? "bg-yellow-500 animate-pulse"
              : "bg-muted-foreground"
          }`}
        />
      </div>
    </div>
  );
};

export default ConversationOrb;

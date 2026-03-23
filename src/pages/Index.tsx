import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Volume2 } from "lucide-react";

const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "Warm & friendly" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", desc: "Deep & authoritative" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", desc: "Soft & calm" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", desc: "Sharp & confident" },
  { id: "MF3mGyEYCl7XYWbV9V9", name: "Elli", desc: "Clear & energetic" },
];

const Index = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem("companion_name", name.trim());
    localStorage.setItem("companion_voice", selectedVoice);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10 space-y-8"
      >
        {/* Logo / Title */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
          >
            <Mic className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Your AI News Companion
          </h1>
          <p className="text-muted-foreground text-sm">
            A voice-first friend who always knows what's happening in the world.
          </p>
        </div>

        {/* Name input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Name your companion
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nova, Atlas, Echo..."
            className="bg-secondary border-border h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
        </div>

        {/* Voice selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Choose a voice
          </label>
          <div className="grid gap-2">
            {VOICES.map((voice) => (
              <motion.button
                key={voice.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  selectedVoice === voice.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/50 hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedVoice === voice.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full h-12 text-base font-display font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          Meet {name.trim() || "your companion"}
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;

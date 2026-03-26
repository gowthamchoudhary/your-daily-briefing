import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ConversationOrb from "@/components/ConversationOrb";
import { ScrollArea } from "@/components/ui/scroll-area";
import DebateToneSelector, { type DebateTone } from "@/components/debate/DebateToneSelector";
import DebateScoreBoard from "@/components/debate/DebateScoreBoard";
import DebateAssistantPanel from "@/components/debate/DebateAssistantPanel";
import { useDebateResearch } from "@/hooks/useDebateResearch";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
  id: string;
}

const TONE_PROMPTS: Record<DebateTone, string> = {
  calm: "Debate in a calm, measured, and respectful manner. Use logic and reason. Stay composed even when challenged.",
  soft: "Debate gently and persuasively. Acknowledge the other side, be diplomatic, but firmly defend your position.",
  aggressive: "Debate aggressively and directly. Be assertive, challenge every point, don't back down. High energy.",
  funny: "Debate with humor and wit. Use jokes, clever analogies, and sarcasm. Keep it entertaining but still make valid points.",
  roasting: "Roast your opponent's arguments mercilessly. Use savage comebacks, burns, and witty takedowns while still making factual points.",
  professor: "Debate like an academic professor. Cite evidence, use data, structured arguments. Be authoritative and scholarly.",
};

const Debate = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Debater";
  const companionVoice = localStorage.getItem("companion_voice") || "21m00Tcm4TlvDq8ikWAM";

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tone, setTone] = useState<DebateTone>("calm");
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(0);
  const [debateTopic, setDebateTopic] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const prefillChecked = useRef(false);

  const { forPoints, againstPoints, isLoading: isResearching, topic, fetchDebatePoints } = useDebateResearch();

  // Check for prefilled topic from news card
  useEffect(() => {
    if (!prefillChecked.current) {
      prefillChecked.current = true;
      const prefill = localStorage.getItem("debate_prefill_topic");
      if (prefill) {
        setTopicInput(prefill);
        localStorage.removeItem("debate_prefill_topic");
      }
    }
  }, []);

  const conversation = useConversation({
    onMessage: (message: any) => {
      if (message.type === "user_transcript") {
        const text = message.user_transcription_event?.user_transcript;
        if (text && text.trim().length > 5) {
          setTranscript((prev) => [
            ...prev,
            { role: "user", text, id: Date.now().toString() },
          ]);
          // Auto-score: user gets a point for each substantive message
          setUserScore((prev) => prev + 1);
          setRound((prev) => prev + 1);
        }
      }
      if (message.type === "agent_response") {
        const text = message.agent_response_event?.agent_response;
        if (text) {
          setTranscript((prev) => [
            ...prev,
            { role: "agent", text, id: Date.now().toString() },
          ]);
          // Auto-score: AI gets a point for each response
          setAiScore((prev) => prev + 1);
        }
      }
    },
    onError: (error: any) => {
      console.error("Debate conversation error:", error);
    },
  });

  const startDebate = useCallback(async () => {
    if (!topicInput.trim()) return;
    setIsConnecting(true);
    setDebateTopic(topicInput.trim());
    setHasStarted(true);

    fetchDebatePoints(topicInput.trim());

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("elevenlabs-signed-url");
      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get signed URL");
      }

      const toneInstruction = TONE_PROMPTS[tone];

      await conversation.startSession({
        signedUrl: data.signed_url,
        overrides: {
          agent: {
            firstMessage: `Alright ${userName}, let's debate! The topic is: "${topicInput.trim()}". I'll take the opposing side. ${toneInstruction} Let's go — make your opening argument!`,
          },
          tts: { voiceId: companionVoice },
        },
      });
    } catch (err) {
      console.error("Failed to start debate:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, userName, companionVoice, tone, topicInput, fetchDebatePoints]);

  const stopDebate = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-background pointer-events-none" />
      {/* Subtle red ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-destructive/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => {
            if (isConnected) stopDebate();
            navigate("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <h2 className="font-display font-semibold text-lg text-destructive">⚔️ Debate Arena</h2>
        <div className="w-16" />
      </header>

      {/* Pre-debate setup */}
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-5 max-w-lg mx-auto w-full"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-display text-destructive">Pick Your Battle</h1>
            <p className="text-sm text-muted-foreground">
              Enter a topic, choose your tone, and let's debate!
            </p>
          </div>

          {/* Topic input */}
          <div className="w-full space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Debate Topic
            </label>
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. AI will replace most jobs in 10 years"
              className="bg-secondary border-border h-11 text-sm"
              onKeyDown={(e) => e.key === "Enter" && startDebate()}
            />
          </div>

          {/* Tone selection */}
          <div className="w-full space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Debate Tone
            </label>
            <DebateToneSelector selected={tone} onSelect={setTone} />
          </div>

          {/* Start button */}
          <Button
            onClick={startDebate}
            disabled={!topicInput.trim() || isConnecting}
            className="w-full h-12 text-base font-display font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isConnecting ? "Setting up arena..." : "⚔️ Start Debate"}
          </Button>
        </motion.div>
      )}

      {/* Active debate */}
      {hasStarted && (
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-5 pb-5 min-h-0">
          {/* Left: Orb + Transcript + Score */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
              <DebateScoreBoard
                userScore={userScore}
                aiScore={aiScore}
                userName={userName}
              />
            </div>

            <ConversationOrb
              isSpeaking={conversation.isSpeaking}
              status={isConnecting ? "connecting" : conversation.status}
            />

            <p className="text-sm text-muted-foreground font-medium">
              {isConnecting
                ? "Entering arena..."
                : isConnected
                ? conversation.isSpeaking
                  ? "AI is arguing..."
                  : "Your turn — speak!"
                : "Debate ended"}
            </p>

            <Button
              onClick={isConnected ? stopDebate : startDebate}
              disabled={isConnecting}
              size="lg"
              className={`rounded-full w-16 h-16 ${
                isConnected
                  ? "bg-destructive hover:bg-destructive/80"
                  : "bg-destructive/80 hover:bg-destructive"
              }`}
            >
              {isConnected ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            <div className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-[10px] text-destructive uppercase tracking-wider font-semibold">
              {tone} mode
            </div>

            {transcript.length > 0 && (
              <ScrollArea className="w-full max-w-lg max-h-36">
                <div className="space-y-2 px-1">
                  {transcript.slice(-6).map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm ${
                        entry.role === "user"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      <span className={`text-xs font-medium mr-2 ${
                        entry.role === "user" ? "text-green-400" : "text-destructive"
                      }`}>
                        {entry.role === "user" ? "You" : "AI"}
                      </span>
                      {entry.text}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Right: Research Assistant Panel */}
          <div className="lg:w-[380px] w-full glass-card overflow-hidden flex flex-col max-h-[calc(100vh-120px)] border-destructive/15">
            <div className="px-4 py-2.5 border-b border-destructive/10 bg-destructive/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Debate Assistant
              </h3>
              <p className="text-[9px] text-muted-foreground/60">Real-time research to help you win</p>
            </div>
            <DebateAssistantPanel
              forPoints={forPoints}
              againstPoints={againstPoints}
              isLoading={isResearching}
              topic={topic}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Debate;

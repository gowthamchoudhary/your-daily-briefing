import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ConversationOrb from "@/components/ConversationOrb";
import NewsCard, { type NewsCardData } from "@/components/NewsCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
  id: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const companionName = localStorage.getItem("companion_name") || "Companion";
  const companionVoice = localStorage.getItem("companion_voice") || "21m00Tcm4TlvDq8ikWAM";

  const [cards, setCards] = useState<NewsCardData[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    clientTools: {
      show_cards: (params: { cards: NewsCardData[] }) => {
        setCards((prev) => [...prev, ...params.cards]);
        return "Cards displayed to user";
      },
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript") {
        const text = message.user_transcription_event?.user_transcript;
        if (text) {
          setTranscript((prev) => [
            ...prev,
            { role: "user", text, id: Date.now().toString() },
          ]);
        }
      }
      if (message.type === "agent_response") {
        const text = message.agent_response_event?.agent_response;
        if (text) {
          setTranscript((prev) => [
            ...prev,
            { role: "agent", text, id: Date.now().toString() },
          ]);
        }
      }
    },
    onError: (error: any) => {
      console.error("Conversation error:", error);
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-signed-url",
        { body: { agentId } }
      );

      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get signed URL");
      }

      await conversation.startSession({
        signedUrl: data.signed_url,
        overrides: {
          agent: {
            firstMessage: `${companionName} is ready. What do you want to know today?`,
          },
          tts: {
            voiceId: companionVoice,
          },
        },
      });
    } catch (err) {
      console.error("Failed to start:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, agentId, companionName, companionVoice]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleAgentIdSubmit = () => {
    if (agentId.trim()) {
      localStorage.setItem(AGENT_ID_KEY, agentId.trim());
      setShowAgentInput(false);
    }
  };

  const isConnected = conversation.status === "connected";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-secondary/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <h2 className="font-display font-semibold text-lg">{companionName}</h2>
        <div className="w-16" />
      </header>

      {/* Agent ID prompt */}
      <AnimatePresence>
        {showAgentInput && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 mx-auto w-full max-w-md px-5 mb-4"
          >
            <div className="glass-card p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your ElevenLabs Agent ID to get started:
              </p>
              <input
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Agent ID from ElevenLabs dashboard"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && handleAgentIdSubmit()}
              />
              <Button onClick={handleAgentIdSubmit} size="sm" className="w-full">
                Save & Continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-5 pb-5">
        {/* Left: Orb + Controls + Transcript */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <ConversationOrb
            isSpeaking={conversation.isSpeaking}
            status={isConnecting ? "connecting" : conversation.status}
          />

          {/* Status text */}
          <p className="text-sm text-muted-foreground font-medium">
            {isConnecting
              ? "Connecting..."
              : isConnected
              ? conversation.isSpeaking
                ? `${companionName} is speaking...`
                : "Listening..."
              : "Ready to talk"}
          </p>

          {/* Mic button */}
          <Button
            onClick={isConnected ? stopConversation : startConversation}
            disabled={isConnecting}
            size="lg"
            className={`rounded-full w-16 h-16 ${
              isConnected
                ? "bg-destructive hover:bg-destructive/80"
                : "bg-primary hover:bg-primary/80"
            }`}
          >
            {isConnected ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Transcript */}
          {transcript.length > 0 && (
            <ScrollArea className="w-full max-w-lg max-h-48 mt-4">
              <div className="space-y-3 px-1">
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
                    <span className="text-xs font-medium text-primary mr-2">
                      {entry.role === "user" ? "You" : companionName}
                    </span>
                    {entry.text}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right: News Cards */}
        <AnimatePresence>
          {cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-96 w-full"
            >
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="space-y-3 pr-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Live Results
                  </h3>
                  {cards.map((card, i) => (
                    <NewsCard key={`${card.url}-${i}`} card={card} index={i} />
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;

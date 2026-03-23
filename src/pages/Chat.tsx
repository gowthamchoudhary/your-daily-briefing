import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ConversationOrb from "@/components/ConversationOrb";
import NewsCard, { type NewsCardData } from "@/components/NewsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNewsLoader } from "@/hooks/useNewsLoader";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
  id: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const companionName = localStorage.getItem("companion_name") || "Companion";
  const companionVoice = localStorage.getItem("companion_voice") || "21m00Tcm4TlvDq8ikWAM";
  const interests = JSON.parse(localStorage.getItem("companion_interests") || "[]") as string[];

  const [cards, setCards] = useState<NewsCardData[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasAutoStarted = useRef(false);

  const { initialCards, isLoading: isLoadingNews } = useNewsLoader();

  // Merge initial cards when loaded
  useEffect(() => {
    if (initialCards.length > 0) {
      setCards((prev) => [...initialCards, ...prev]);
    }
  }, [initialCards]);

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
        "elevenlabs-signed-url"
      );

      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get signed URL");
      }

      const interestsContext = interests.length > 0
        ? `The user is interested in: ${interests.join(", ")}.`
        : "";

      await conversation.startSession({
        signedUrl: data.signed_url,
        overrides: {
          agent: {
            firstMessage: `Hey! ${companionName} here. ${interestsContext} I've pulled up some headlines for you. Want me to walk you through what's happening?`,
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
  }, [conversation, companionName, companionVoice, interests]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Auto-start conversation on mount
  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startConversation();
    }
  }, [startConversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-secondary/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => {
            if (isConnected) stopConversation();
            navigate("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <h2 className="font-display font-semibold text-lg">{companionName}</h2>
        <div className="w-16" />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-5 pb-5">
        {/* Left: Orb + Controls + Transcript */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <ConversationOrb
            isSpeaking={conversation.isSpeaking}
            status={isConnecting ? "connecting" : conversation.status}
          />

          <p className="text-sm text-muted-foreground font-medium">
            {isConnecting
              ? "Connecting..."
              : isConnected
              ? conversation.isSpeaking
                ? `${companionName} is speaking...`
                : "Listening..."
              : "Ready to talk"}
          </p>

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
          {(cards.length > 0 || isLoadingNews) && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-96 w-full"
            >
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="space-y-3 pr-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    {isLoadingNews ? "Loading your feed..." : "Your Feed"}
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

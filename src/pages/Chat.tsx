import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ConversationOrb from "@/components/ConversationOrb";
import NewsFeed from "@/components/NewsFeed";
import { useNewsLoader } from "@/hooks/useNewsLoader";
import type { NewsCardData } from "@/components/NewsCard";

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

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasAutoStarted = useRef(false);

  const { cards, setCards, isLoading: isLoadingNews, activeCategory, fetchCategory } = useNewsLoader();

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
      const { data, error } = await supabase.functions.invoke("elevenlabs-signed-url");
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
            firstMessage: `Hey ${companionName}! Just got the latest news for you. ${interestsContext} Let me walk you through what's trending right now.`,
          },
          tts: { voiceId: companionVoice },
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

  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startConversation();
    }
  }, [startConversation]);

  const isConnected = conversation.status === "connected";
  const lastAgent = [...transcript].reverse().find((e) => e.role === "agent");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Subtle gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button
          onClick={() => {
            if (isConnected) stopConversation();
            navigate("/");
          }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-display font-semibold text-base">{companionName}</h2>
        <div className="w-8" />
      </header>

      {/* Compact orb + status strip */}
      <div className="relative z-10 flex items-center gap-4 px-4 py-3">
        <div className="flex-shrink-0">
          <div className="w-14 h-14">
            <ConversationOrb
              isSpeaking={conversation.isSpeaking}
              status={isConnecting ? "connecting" : conversation.status}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {lastAgent ? (
            <motion.p
              key={lastAgent.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-foreground/90 line-clamp-2 leading-relaxed"
            >
              {lastAgent.text}
            </motion.p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isConnecting ? "Connecting..." : isConnected
                ? conversation.isSpeaking ? "Speaking..." : "Listening..."
                : "Tap mic to start"}
            </p>
          )}
        </div>

        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isConnected
              ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground"
              : "bg-primary/90 hover:bg-primary text-primary-foreground"
          } disabled:opacity-50`}
        >
          {isConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* News Feed - takes remaining space */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <NewsFeed
          cards={cards}
          isLoading={isLoadingNews}
          activeCategory={activeCategory}
          onCategorySelect={fetchCategory}
        />
      </div>
    </div>
  );
};

export default Chat;

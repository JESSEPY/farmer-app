"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Bot, User, Sprout, CloudSun, ShoppingCart, Bug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { AnimatedAIChat, TypingIndicator } from "@/components/ui/animated-ai-chat";
import { AiMessageRenderer } from "@/components/chat/ai-message-renderer";

const FARMING_COMMANDS = [
  { 
    icon: <Sprout className="w-4 h-4" />, 
    label: "Crops", 
    description: "Get crop advice and schedules", 
    prefix: "/crop" 
  },
  { 
    icon: <CloudSun className="w-4 h-4" />, 
    label: "Weather", 
    description: "Check weather forecasts", 
    prefix: "/weather" 
  },
  { 
    icon: <ShoppingCart className="w-4 h-4" />, 
    label: "Market", 
    description: "Check market prices", 
    prefix: "/market" 
  },
  { 
    icon: <Bug className="w-4 h-4" />, 
    label: "Pests", 
    description: "Identify pests and solutions", 
    prefix: "/pest" 
  },
];

export default function ChatPage() {
  const { messages, isLoading, sendMessage, quickQuestions } = useAIAssistant();
  const [input, setInput] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    
    if (newInput.startsWith('/') && !newInput.includes(' ')) {
      setShowCommandPalette(true);
      
      const matchingIndex = FARMING_COMMANDS.findIndex(
        (cmd) => cmd.prefix.startsWith(newInput)
      );
      
      setActiveSuggestion(matchingIndex >= 0 ? matchingIndex : -1);
    } else {
      setShowCommandPalette(false);
      setActiveSuggestion(-1);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, messages);
    setInput("");
  }, [input, isLoading, sendMessage, messages]);

  const handleQuickQuestion = (question: string) => {
    if (!isLoading) {
      setInput(question);
    }
  };

  const handleSelectSuggestion = (index: number) => {
    const selected = FARMING_COMMANDS[index];
    setInput(selected.prefix + ' ');
    setShowCommandPalette(false);
  };

  return (
    <PageContainer>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Assistant
            </h1>
            <p className="text-muted-foreground text-sm">Get farming advice and recommendations</p>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 min-h-0 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "assistant" ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-lg max-w-[80%] ${
                      message.role === "assistant" ? "bg-muted/50" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <AiMessageRenderer content={message.content} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <TypingIndicator />
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area with Animated AI Chat */}
          <div className="p-4 border-t border-border">
            <AnimatedAIChat
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSend}
              isLoading={isLoading}
              showCommandPalette={showCommandPalette}
              onToggleCommandPalette={() => setShowCommandPalette(!showCommandPalette)}
              commandSuggestions={FARMING_COMMANDS}
              activeSuggestion={activeSuggestion}
              onSelectSuggestion={handleSelectSuggestion}
            />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
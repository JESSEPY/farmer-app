"use client";

import { useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/page-container";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  "What fertilizer for rice?",
  "When to harvest corn?",
  "Pest control tips",
  "Weather forecast",
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI farming assistant. I can help you with:\n\n• Crop management and schedules\n• Fertilizer recommendations\n• Pest and disease identification\n• Weather-based advice\n• Harvest timing\n\nHow can I help you today?",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const getMockResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes("fertilizer") || lower.includes("fertil")) {
      return "For rice cultivation, I recommend:\n\n**Basal (0-7 days):** Apply 60kg/ha of complete fertilizer (14-14-14)\n\n**Side-dress (21-30 days):** Add 40kg/ha urea\n\n**Foliar (45-60 days):** Spray with liquid fertilizer containing micronutrients\n\nAlways base your application on soil test results!";
    }
    if (lower.includes("harvest") || lower.includes("corn")) {
      return "For corn, harvest time depends on the variety:\n\n**Sweet Corn:** 60-70 days after planting (when silks turn brown)\n\n**Field Corn:** 100-120 days (when kernels are hard and moisture is 20-25%)\n\n**Signs ready to harvest:**\n• Kernels hard when pressed\n• Leaves turning brown\n• Husks completely dry";
    }
    if (lower.includes("pest") || lower.includes("disease")) {
      return "Common rice pests and solutions:\n\n**Brown Planthopper:**\n• Use resistant varieties\n• Apply imidacloprid\n• Maintain proper plant spacing\n\n**Rice Stem Borer:**\n• Remove crop residues\n• Use pheromone traps\n• Apply carbofuran at nursery stage\n\n**Blast Disease:**\n• Avoid excessive nitrogen\n• Apply fungicide at heading stage\n• Use resistant varieties";
    }
    return "I understand you're asking about: \"" + query + "\"\n\nFor more specific advice, please mention:\n• Which crop you're growing\n• Your current growth stage\n• Any symptoms you're observing\n\nThis will help me provide better recommendations!";
  };

  return (
    <PageContainer>
      <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto">
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "assistant" 
                      ? "bg-primary/10" 
                      : "bg-muted"
                  }`}>
                    {message.role === "assistant" 
                      ? <Bot className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4" />
                    }
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${
                    message.role === "assistant" 
                      ? "bg-muted/50" 
                      : "bg-primary text-primary-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 p-3">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="cursor-pointer">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
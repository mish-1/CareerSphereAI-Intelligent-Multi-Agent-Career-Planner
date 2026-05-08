"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { runMentorChat, type ApiError } from "@/lib/api";
import { useResults } from "@/lib/results-context";

type Message = {
  role: "Mentor" | "You";
  text: string;
};

const initialMessages: Message[] = [
  { role: "Mentor", text: "I am CareerSphere's Mentor Agent. How can I help you focus your career strategy today?" },
];

export default function MentorChatPage() {
  const { addResult } = useResults();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "You", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const response = await runMentorChat({ 
          messages: newMessages.map(m => ({ 
            role: m.role === "You" ? "user" : "assistant", 
            content: m.text 
          })) 
        });
        const mentorResponse = response.data || response;
        
        const mentorMessage: Message = { role: "Mentor", text: mentorResponse.text };
        setMessages(prev => [...prev, mentorMessage]);

        addResult({
          type: "mentor-chat",
          title: "Mentor Chat Session",
          data: { conversation: [...newMessages, mentorMessage] },
        });

      } catch (error) {
        const apiError = error as ApiError | Error;
        const errorMessage = "message" in apiError ? apiError.message : "Failed to get response from mentor.";
        const errorResponse: Message = { role: "Mentor", text: `Sorry, I encountered an error: ${errorMessage}` };
        setMessages(prev => [...prev, errorResponse]);
        
        addResult({
          type: "mentor-chat",
          title: "Mentor Chat Error",
          data: { conversation: newMessages },
          error: errorMessage,
        });
      }
    });
  };

  return (
    <Card className="flex h-[80vh] flex-col p-6">
      <div className="mb-4">
        <CardDescription>Mentor agent</CardDescription>
        <CardTitle>Career mentorship chat</CardTitle>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-4">
        {messages.map((message, index) => (
          <div key={index} className={`max-w-3xl rounded-2xl border px-4 py-3 ${message.role === "You" ? "ml-auto border-primary bg-primary/10" : "border-border bg-background/80"}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{message.role}</p>
            <p className="mt-2 text-sm leading-6">{message.text}</p>
          </div>
        ))}
        {isPending && (
            <div className="max-w-3xl rounded-2xl border border-border bg-background/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mentor</p>
                <p className="mt-2 animate-pulse text-sm leading-6">Thinking...</p>
            </div>
        )}
      </div>

      <div className="mt-4 flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Ask for career advice..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isPending}
        />
        <Button onClick={handleSendMessage} disabled={isPending || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

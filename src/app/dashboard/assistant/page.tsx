"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { answerBusinessQuestions } from "@/ai/flows/answer-business-questions";
import { fullBusinessDataString } from "@/lib/mock-data";


type Message = {
  sender: "user" | "ai";
  text: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! How can I help you analyze your business data today? Ask me anything about your performance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const result = await answerBusinessQuestions({
        question: currentInput,
        businessData: fullBusinessDataString,
      });
      const aiResponse: Message = {
        sender: "ai",
        text: result.answer,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error with AI assistant:", error);
      const errorResponse: Message = {
        sender: "ai",
        text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card className="flex h-[calc(100vh-8rem)] flex-col">
        <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Ask natural language questions about your business</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn("flex items-start gap-4",
                    message.sender === "user" ? "justify-end" : ""
                  )}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn("max-w-md rounded-lg p-3 shadow-md",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-9 w-9 border-2 border-accent">
                      <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                  <div className="max-w-md rounded-lg p-3 bg-muted flex items-center gap-2 shadow-md">
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'What was my total revenue last month?'"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90" size="icon" aria-label="Send Message">
              <Send className="h-5 w-5"/>
            </Button>
          </form>
        </div>
      </Card>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, RotateCcw } from "lucide-react";
import { NotionPromptForm } from "@/components/chatbox/chat-input";
import { nanoid } from "nanoid";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
  error?: string;
}

interface TopicData {
  topic: string;
  summary: string;
  key_concepts: string[];
  prerequisites: string[];
  difficulty_level: string;
  estimated_hours: number;
  resources: any[];
  subtopics: string[];
  current_trends: string[];
  career_applications: string[];
}

interface TopicChatbotProps {
  topic: string;
  topicData: TopicData;
}

export function TopicChatbot({ topic, topicData }: TopicChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nanoid(),
      content: `Hello! I'm your AI assistant specialized in ${topic}. I can help you understand key concepts, answer questions, and guide your learning journey. What would you like to know about ${topic}?`,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const sendToLettuce = useCallback(async (userMessage: string, messageHistory: ChatMessage[]) => {
    try {
      // Create a context-aware prompt that includes topic information
      const contextPrompt = `You are an expert AI assistant specializing in ${topic}. 

Topic Context:
- Summary: ${topicData.summary}
- Key Concepts: ${topicData.key_concepts.join(", ")}
- Difficulty Level: ${topicData.difficulty_level}
- Prerequisites: ${topicData.prerequisites.join(", ")}
- Current Trends: ${topicData.current_trends.join(", ")}
- Career Applications: ${topicData.career_applications.join(", ")}

User Question: ${userMessage}

Please provide a helpful, accurate response that leverages your expertise in ${topic}. If the user asks about related topics, feel free to suggest connections to the subtopics: ${topicData.subtopics.join(", ")}.`;

      const response = await fetch("/api/letta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: contextPrompt,
          agentId: "agent-afeee9a5-ad56-48e8-952b-dc8371a75ca4",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        content: data.text,
        usage: null,
      };
    } catch (error) {
      console.error("Error calling Letta API:", error);
      throw error;
    }
  }, [topic, topicData]);

  const streamFromLettuce = useCallback(async (userMessage: string, messageHistory: ChatMessage[], currentStreamingId: string) => {
    try {
      const contextPrompt = `You are an expert AI assistant specializing in ${topic}. 

Topic Context:
- Summary: ${topicData.summary}
- Key Concepts: ${topicData.key_concepts.join(", ")}
- Difficulty Level: ${topicData.difficulty_level}
- Prerequisites: ${topicData.prerequisites.join(", ")}
- Current Trends: ${topicData.current_trends.join(", ")}
- Career Applications: ${topicData.career_applications.join(", ")}

User Question: ${userMessage}

Please provide a helpful, accurate response that leverages your expertise in ${topic}. If the user asks about related topics, feel free to suggest connections to the subtopics: ${topicData.subtopics.join(", ")}.`;

      const response = await fetch("/api/letta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: contextPrompt,
          agentId: "agent-afeee9a5-ad56-48e8-952b-dc8371a75ca4",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.content) {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id === currentStreamingId) {
                    return {
                      ...msg,
                      content: fullContent,
                      isStreaming: !data.done,
                    };
                  }
                  return msg;
                })
              );
            }
            
            if (data.done) {
              setIsTyping(false);
              setStreamingMessageId(null);
              return { content: fullContent, usage: null };
            }
          } catch (e) {
            console.warn('Failed to parse streaming data:', line, e);
            continue;
          }
        }
      }

      return { content: fullContent, usage: null };
    } catch (error) {
      console.error("Error streaming from Letta API:", error);
      throw error;
    }
  }, [topic, topicData]);

  const handleSend = useCallback(
    async (value: string) => {
      if (!value.trim() || isTyping) return;
      
      const userMessage: ChatMessage = {
        id: nanoid(),
        content: value.trim(),
        role: "user",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      const assistantMessageId = nanoid();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessageId);

      try {
        const result = await streamFromLettuce(value.trim(), [...messages, userMessage], assistantMessageId);
        
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: result.content,
                isStreaming: false,
              };
            }
            return msg;
          })
        );
      } catch (error) {
        console.error("Error in chat component:", error);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: "I encountered an issue processing your request. Please try again or rephrase your message.",
                isStreaming: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
            return msg;
          })
        );
        setIsTyping(false);
        setStreamingMessageId(null);
      }
    },
    [isTyping, messages, streamFromLettuce]
  );

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: nanoid(),
        content: `Hello! I'm your AI assistant specialized in ${topic}. I can help you understand key concepts, answer questions, and guide your learning journey. What would you like to know about ${topic}?`,
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
    setStreamingMessageId(null);
  }, [topic]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <CardTitle>AI Assistant for {topic}</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isTyping}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.isStreaming && message.content === "" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isStreaming && message.content && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                        <span className="text-xs">Streaming...</span>
                      </div>
                    )}
                  </div>
                )}
                {message.error && (
                  <div className="text-red-200 text-sm mt-2">
                    Error: {message.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestions */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              `What are the key concepts in ${topic}?`,
              `How difficult is ${topic} to learn?`,
              `What are the prerequisites for ${topic}?`,
              `What career opportunities does ${topic} offer?`
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSend(suggestion)}
                disabled={isTyping}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <NotionPromptForm onSend={handleSend} disabled={isTyping} />
      </CardContent>
    </Card>
  );
}

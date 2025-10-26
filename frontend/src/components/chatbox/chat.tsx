"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/shadcn-io/ai/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/shadcn-io/ai/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ui/shadcn-io/ai/source";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { NotionPromptForm } from "./chat-input";

type ChatMessage = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
  error?: string;
};

const API_BASE_URL = "/api/letta";

const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nanoid(),
      content:
        "Hello! I'm your AI assistant powered by Letta. I can help you with questions, provide guidance, and have meaningful conversations. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const sendToLettuce = useCallback(async (userMessage: string, messageHistory: ChatMessage[]) => {
    try {
      // Use the latest user message as the prompt
      const prompt = userMessage;

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          agentId: "agent-afeee9a5-ad56-48e8-952b-dc8371a75ca4", // You'll need to replace this with your actual agent ID
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
        usage: null, // Letta doesn't return usage info in this format
      };
    } catch (error) {
      console.error("Error calling Letta API:", error);
      throw error;
    }
  }, []);

  const streamFromLettuce = useCallback(async (userMessage: string, messageHistory: ChatMessage[], currentStreamingId: string) => {
    try {
      console.log('Starting stream from Letta...');
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
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
            const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.content) {
              fullContent += data.content;
              console.log('Streaming content update:', { content: data.content, fullLength: fullContent.length });
              // Update the streaming message
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
  }, []);

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

      // Create assistant message placeholder
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
        console.log("Sending message to Letta:", value.trim());
        // Use streaming for real-time response
        const result = await streamFromLettuce(value.trim(), [...messages, userMessage], assistantMessageId);
        console.log("Streaming completed from Letta:", result);
        
        // Final update with complete content
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
        // Handle error
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: "I encountered an issue processing your request. This might be due to conflicting information or a temporary error. Please try again or rephrase your message.",
                isStreaming: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
            return msg;
          })
        );
        // Always reset typing state and streaming message ID on error
        setIsTyping(false);
        setStreamingMessageId(null);
      } finally {
        // Ensure we always reset the typing state, even if there's an unexpected error
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
        content:
          "Hello! I'm your AI assistant powered by Letta. I can help you with questions, provide guidance, and have meaningful conversations. What would you like to know?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
    setStreamingMessageId(null);
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Letta AI Assistant - Mentora</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isTyping}
        >
          <RotateCcwIcon className="h-4 w-4 mr-2" />
          Reset Chat
        </Button>
      </div>
      
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <Message from={message.role}>
                <MessageContent>
                  {message.isStreaming && message.content === "" ? (
                    <div className="flex items-center gap-2">
                      <Loader size={14} />
                      <span className="text-muted-foreground text-sm">
                        Thinking...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {message.content}
                      {message.isStreaming && message.content && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Streaming...</span>
                        </div>
                      )}
                    </div>
                  )}
                  {message.error && (
                    <div className="text-red-500 text-sm mt-2 space-y-2">
                      <div>Error: {message.error}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Retry the last message
                          const lastUserMessage = messages
                            .filter(m => m.role === "user")
                            .slice(-1)[0];
                          if (lastUserMessage) {
                            handleSend(lastUserMessage.content);
                          }
                        }}
                        className="text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </MessageContent>
                <MessageAvatar
                  src={
                    message.role === "user"
                      ? "https://github.com/dovazencot.png"
                      : "https://github.com/vercel.png"
                  }
                  name={message.role === "user" ? "User" : "Letta AI"}
                />
              </Message>
              {/* Reasoning */}
              {message.reasoning && (
                <div className="ml-10">
                  <Reasoning
                    isStreaming={message.isStreaming}
                    defaultOpen={false}
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>{message.reasoning}</ReasoningContent>
                  </Reasoning>
                </div>
              )}
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="ml-10">
                  <Sources>
                    <SourcesTrigger count={message.sources.length} />
                    <SourcesContent>
                      {message.sources.map((source, index) => (
                        <Source
                          key={index}
                          href={source.url}
                          title={source.title}
                        />
                      ))}
                    </SourcesContent>
                  </Sources>
                </div>
              )}
            </div>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {/* Input Area */}
      <div className="p-4">
        <NotionPromptForm onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
};

export default Chatbot;
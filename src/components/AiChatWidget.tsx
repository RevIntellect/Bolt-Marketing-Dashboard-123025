import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ConnectionStatus {
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
}

export function AiChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const { data, error } = await supabase
        .from("connection_status")
        .select("*")
        .eq("service_name", "dataslayer")
        .maybeSingle();

      if (error) throw error;
      setConnectionStatus(data);
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const clearChatHistory = async () => {
    try {
      const { error } = await supabase
        .from("ai_chat_messages")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      setMessages([]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (connectionStatus?.status !== "connected") {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Dataslayer MCP is not connected. Please configure your Dataslayer credentials in Settings before using the chat assistant.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { data: savedUserMsg, error: userError } = await supabase
        .from("ai_chat_messages")
        .insert({ role: "user", content: userMessage })
        .select()
        .single();

      if (userError) throw userError;

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dataslayer-chat`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory
        }),
      });

      const result = await response.json();

      if (result.connectionRequired) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response || "Dataslayer MCP is not connected.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          savedUserMsg,
          errorMsg,
        ]);
        return;
      }

      if (!result.response) {
        throw new Error("No response from AI");
      }

      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from("ai_chat_messages")
        .insert({ role: "assistant", content: result.response })
        .select()
        .single();

      if (assistantError) throw assistantError;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        savedUserMsg,
        savedAssistantMsg,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed top-6 right-6 w-[500px] h-[700px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 opacity-100">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">ChatGPT Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by Dataslayer MCP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={clearChatHistory}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isCheckingConnection ? (
            <div className="p-4 flex items-center gap-2 bg-muted/30">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Checking Dataslayer connection...</span>
            </div>
          ) : connectionStatus?.status !== "connected" ? (
            <Alert className="m-4 border-orange-500/50 bg-orange-50 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-1">Dataslayer MCP Not Connected</p>
                <p className="text-xs mb-2">This assistant requires Dataslayer to query your marketing data.</p>
                <Button
                  onClick={() => navigate("/settings")}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                >
                  Configure in Settings
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Dataslayer Connected
              </p>
            </div>
          )}

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2 font-medium">ChatGPT Marketing Assistant</p>
                  <p className="text-xs mb-3">
                    Query your live marketing data from Google Ads, GA4, LinkedIn, and more.
                  </p>
                  <div className="text-left text-xs space-y-1 bg-muted/50 rounded-lg p-3 max-w-xs mx-auto">
                    <p className="font-medium mb-2">Data Sources Available:</p>
                    <p>• Google Ads & Analytics 4</p>
                    <p>• LinkedIn Ads & Pages</p>
                    <p>• Google Search Console</p>
                    <p>• Google Sheets</p>
                    <p className="font-medium mt-3 mb-2">Example Queries:</p>
                    <p>• "Show me last 30 days of ad spend"</p>
                    <p>• "Compare campaign performance"</p>
                    <p>• "What's my ROAS by channel?"</p>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your marketing data..."
                disabled={isLoading || connectionStatus?.status !== "connected"}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || connectionStatus?.status !== "connected"}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by ChatGPT with Dataslayer MCP
            </p>
          </div>
        </div>
      )}
    </>
  );
}

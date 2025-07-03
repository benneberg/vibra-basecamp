import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, User, Bot, Code, Palette, Bug, FileText, Paperclip } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'code' | 'debug' | 'design' | 'documentation';
}

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, type?: string) => void;
  isLoading?: boolean;
}

export const ChatView = ({ messages, onSendMessage, isLoading }: ChatViewProps) => {
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const actionTypes = [
    { id: 'code', label: 'Generate Code', icon: Code, color: 'text-primary' },
    { id: 'debug', label: 'Debug Code', icon: Bug, color: 'text-destructive' },
    { id: 'design', label: 'Web Design', icon: Palette, color: 'text-accent' },
    { id: 'documentation', label: 'Documentation', icon: FileText, color: 'text-secondary-foreground' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), selectedType);
    setMessage("");
    setSelectedType(undefined);
  };

  const getMessageIcon = (role: string, type?: string) => {
    if (role === 'user') return <User className="w-4 h-4" />;
    
    switch (type) {
      case 'code': return <Code className="w-4 h-4 text-primary" />;
      case 'debug': return <Bug className="w-4 h-4 text-destructive" />;
      case 'design': return <Palette className="w-4 h-4 text-accent" />;
      case 'documentation': return <FileText className="w-4 h-4 text-secondary-foreground" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Type Selector */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex flex-wrap gap-2">
          {actionTypes.map((type) => (
            <Badge
              key={type.id}
              variant={selectedType === type.id ? "default" : "secondary"}
              className={`cursor-pointer glass-hover ${
                selectedType === type.id ? 'gradient-primary' : 'glass'
              }`}
              onClick={() => setSelectedType(selectedType === type.id ? undefined : type.id)}
            >
              <type.icon className={`w-3 h-3 mr-1 ${type.color}`} />
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Assistant Ready</h3>
              <p className="text-muted-foreground">
                Start a conversation to generate code, debug issues, create designs, or write documentation.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-4 glass ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'glass-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(msg.role, msg.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        {msg.type && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {actionTypes.find(t => t.id === msg.type)?.label || msg.type}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="p-4 border-t border-glass-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selectedType 
                  ? `Ask AI to ${actionTypes.find(t => t.id === selectedType)?.label.toLowerCase()}...`
                  : "Ask AI anything about your project..."
              }
              className="glass pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="gradient-primary hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
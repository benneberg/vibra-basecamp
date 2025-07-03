import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, CheckCircle, Download } from "lucide-react";
import { ChatView, ChatMessage } from "@/components/AIAssistant/ChatView";
import { WorkflowStage } from "./WorkflowSection";
import { useToast } from "@/hooks/use-toast";

interface WorkflowChatProps {
  stage: WorkflowStage;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export const WorkflowChat = ({ stage, onBack, onComplete, isCompleted }: WorkflowChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Welcome to the ${stage.title} stage! I'm specialized in ${stage.description.toLowerCase()}. How can I help you with this stage of your project?`,
      timestamp: new Date(),
      type: stage.id as any,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const Icon = stage.icon;

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: stage.id as any,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `This is a simulated response for the ${stage.title} stage. In a real implementation, this would connect to your AI service with the specialized system prompt: "${stage.systemPrompt}"`,
        timestamp: new Date(),
        type: stage.id as any,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyOutput = () => {
    const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();
    if (lastAiMessage) {
      navigator.clipboard.writeText(lastAiMessage.content);
      toast({
        title: "Copied to clipboard",
        description: "The output has been copied and can be used in the next stage",
      });
    }
  };

  const handleExportSession = () => {
    const sessionData = {
      stage: stage.title,
      timestamp: new Date().toISOString(),
      messages: messages,
    };
    
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stage.id}-session-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Session exported",
      description: "Your workflow session has been downloaded",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className={`p-2 rounded-lg glass ${stage.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div>
              <h1 className="text-lg font-semibold">{stage.title}</h1>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={handleCopyOutput}>
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleExportSession}>
              <Download className="w-4 h-4" />
            </Button>
            
            {!isCompleted && (
              <Button size="sm" onClick={onComplete} className="gradient-primary">
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatView
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Stage Info Panel */}
      <div className="p-4 border-t border-glass-border glass">
        <Card className="p-3 glass">
          <h3 className="text-sm font-medium mb-2">Stage Focus:</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stage.systemPrompt.substring(0, 200)}...
          </p>
        </Card>
      </div>
    </div>
  );
};
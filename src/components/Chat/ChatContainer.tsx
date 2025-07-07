import { ChatView } from "@/components/AIAssistant/ChatView";
import { RenderPanel } from "@/components/CodeRenderer/RenderPanel";
import { useChat } from "@/hooks/useChat";
import { ContextSource } from "@/types";
import { useState } from "react";
import { ContextService } from "@/services/contextService";


import type { AISettings } from "@/types";

interface ChatContainerProps {
  projectId: string;
  aiSettings: AISettings;
  contextSources?: ContextSource[];
}


export const ChatContainer = ({ projectId, aiSettings, contextSources: initialContextSources = [] }: ChatContainerProps) => {
  const [contextSources, setContextSources] = useState<ContextSource[]>(initialContextSources);
  const { messages, isLoading, generatedCode, sendMessage } = useChat(projectId, aiSettings);

  const handleFileUpload = async (files: FileList) => {
    const newSources: ContextSource[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const contextSource = await ContextService.processFile(files[i]);
        contextSource.status = 'ready';
        newSources.push(contextSource);
      } catch (error) {
        // Optionally handle error, e.g. show toast
      }
    }
    setContextSources(prev => [...prev, ...newSources]);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <ChatView
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onFileUpload={handleFileUpload}
        />
      </div>
      <div className="w-1/2 border-l border-glass-border">
        <RenderPanel
          htmlCode={generatedCode.html}
          cssCode={generatedCode.css}
          jsCode={generatedCode.js}
          isVisible={true}
        />
      </div>
    </div>
  );
};
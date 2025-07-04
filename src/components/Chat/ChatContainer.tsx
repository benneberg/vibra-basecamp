import { ChatView } from "@/components/AIAssistant/ChatView";
import { RenderPanel } from "@/components/CodeRenderer/RenderPanel";
import { useChat } from "@/hooks/useChat";

interface ChatContainerProps {
  projectId: string;
  aiSettings: any;
}

export const ChatContainer = ({ projectId, aiSettings }: ChatContainerProps) => {
  const { messages, isLoading, generatedCode, sendMessage } = useChat(projectId, aiSettings);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <ChatView
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
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
// Fallback UUID v4 generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { useState, useEffect } from "react";
import { LocalStorageService } from "@/services/localStorage";
import { GroqAPIService, GroqMessage } from "@/services/groqAPI";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, AISettings } from "@/types";

export const useChat = (
  projectId: string | null,
  aiSettings: AISettings,
  // Optionally allow contextSources for context-aware chat
  contextSources?: unknown
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{
    html?: string;
    css?: string;
    js?: string;
  }>({});
  
  const { toast } = useToast();
  const groqAPI = new GroqAPIService();

  useEffect(() => {
    if (projectId) {
      const loadedMessages = LocalStorageService.getChatMessages(projectId);
      setMessages(loadedMessages);
    } else {
      setMessages([]);
    }
  }, [projectId]);

  const extractCodeFromResponse = (content: string) => {
    const codeBlocks = {
      html: '',
      css: '',
      js: ''
    };

    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/i) || 
                     content.match(/```\n((?:[^`]|`(?!``))*html[\s\S]*?)\n```/i);
    if (htmlMatch) codeBlocks.html = htmlMatch[1].trim();

    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/i) ||
                    content.match(/```\n((?:[^`]|`(?!``))*css[\s\S]*?)\n```/i);
    if (cssMatch) codeBlocks.css = cssMatch[1].trim();

    const jsMatch = content.match(/```(?:javascript|js)\n([\s\S]*?)\n```/i) ||
                   content.match(/```\n((?:[^`]|`(?!``))*(?:javascript|js)[\s\S]*?)\n```/i);
    if (jsMatch) codeBlocks.js = jsMatch[1].trim();

    return codeBlocks;
  };

  const sendMessage = async (
    message: string,
    type?: 'code' | 'debug' | 'design' | 'documentation'
  ) => {
    if (!projectId) return;

    const userMessage: ChatMessage = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : uuidv4(),
      role: 'user',
      type,
      content: message,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    LocalStorageService.saveChatMessages(projectId, updatedMessages);

    setIsLoading(true);

    try {
      const apiMessages: GroqMessage[] = [
        {
          role: 'system',
          content: aiSettings.systemPrompt,
        },
        ...updatedMessages.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      let responseContent = '';

      if (aiSettings.enableStreaming) {
        const assistantMessage: ChatMessage = {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : uuidv4(),
          role: 'assistant',
          type,
          content: '',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        for await (const chunk of groqAPI.streamMessage(apiMessages, aiSettings)) {
          responseContent += chunk;
          assistantMessage.content = responseContent;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: responseContent } 
                : msg
            )
          );
        }

        const finalMessages = updatedMessages.concat(assistantMessage);
        LocalStorageService.saveChatMessages(projectId, finalMessages);
      } else {
        responseContent = await groqAPI.sendMessage(apiMessages, aiSettings);
        
        const assistantMessage: ChatMessage = {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : uuidv4(),
          role: 'assistant',
          type,
          content: responseContent,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        LocalStorageService.saveChatMessages(projectId, finalMessages);
      }

      const extractedCode = extractCodeFromResponse(responseContent);
      if (extractedCode.html || extractedCode.css || extractedCode.js) {
        setGeneratedCode(extractedCode);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    generatedCode,
    sendMessage,
  };
};
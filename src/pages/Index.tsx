import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { ProjectList, Project } from "@/components/ProjectManagement/ProjectList";
import { CreateProject } from "@/components/ProjectManagement/CreateProject";
import { ChatView, ChatMessage } from "@/components/AIAssistant/ChatView";
import { RenderPanel } from "@/components/CodeRenderer/RenderPanel";
import { SettingsPage, AISettings } from "@/components/Settings/SettingsPage";
import { WorkflowSection } from "@/components/Workflow/WorkflowSection";
import { LocalStorageService } from "@/services/localStorage";
import { GroqAPIService, GroqMessage } from "@/services/groqAPI";
import { useToast } from "@/hooks/use-toast";

type AppView = 'projects' | 'create-project' | 'chat' | 'settings' | 'workflow';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiSettings, setAISettings] = useState<AISettings>(LocalStorageService.getAISettings());
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{
    html?: string;
    css?: string;
    js?: string;
  }>({});

  const { toast } = useToast();
  const groqAPI = new GroqAPIService();

  // Load initial data
  useEffect(() => {
    const loadedProjects = LocalStorageService.getProjects();
    setProjects(loadedProjects);
    
    const currentProjectData = LocalStorageService.getCurrentProject();
    if (currentProjectData) {
      setCurrentProject(currentProjectData);
      const messages = LocalStorageService.getChatMessages(currentProjectData.id);
      setChatMessages(messages);
      setCurrentView('chat');
    }
  }, []);

  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const newProject = LocalStorageService.createProject(name, description);
      setProjects(prev => [newProject, ...prev.filter(p => p.id !== newProject.id)]);
      setCurrentProject(newProject);
      LocalStorageService.setCurrentProject(newProject.id);
      setChatMessages([]);
      setCurrentView('chat');
      
      toast({
        title: "Project created!",
        description: `${name} is ready for development`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    LocalStorageService.setCurrentProject(project.id);
    const messages = LocalStorageService.getChatMessages(project.id);
    setChatMessages(messages);
    setCurrentView('chat');
  };

  const handleDeleteProject = (projectId: string) => {
    LocalStorageService.deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      setChatMessages([]);
      setCurrentView('projects');
    }
    
    toast({
      title: "Project deleted",
      description: "Project and all its data have been removed",
    });
  };

  const extractCodeFromResponse = (content: string) => {
    const codeBlocks = {
      html: '',
      css: '',
      js: ''
    };

    // Extract HTML
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/i) || 
                     content.match(/```\n((?:[^`]|`(?!``))*html[\s\S]*?)\n```/i);
    if (htmlMatch) codeBlocks.html = htmlMatch[1].trim();

    // Extract CSS
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/i) ||
                    content.match(/```\n((?:[^`]|`(?!``))*css[\s\S]*?)\n```/i);
    if (cssMatch) codeBlocks.css = cssMatch[1].trim();

    // Extract JavaScript
    const jsMatch = content.match(/```(?:javascript|js)\n([\s\S]*?)\n```/i) ||
                   content.match(/```\n((?:[^`]|`(?!``))*(?:javascript|js)[\s\S]*?)\n```/i);
    if (jsMatch) codeBlocks.js = jsMatch[1].trim();

    return codeBlocks;
  };

  const handleSendMessage = async (message: string, type?: string) => {
    if (!currentProject) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: type as any,
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    LocalStorageService.saveChatMessages(currentProject.id, updatedMessages);

    setIsLoading(true);

    try {
      // Prepare messages for API
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
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          type: type as any,
        };

        setChatMessages(prev => [...prev, assistantMessage]);

        for await (const chunk of groqAPI.streamMessage(apiMessages, aiSettings)) {
          responseContent += chunk;
          assistantMessage.content = responseContent;
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: responseContent } 
                : msg
            )
          );
        }

        const finalMessages = updatedMessages.concat(assistantMessage);
        LocalStorageService.saveChatMessages(currentProject.id, finalMessages);
      } else {
        responseContent = await groqAPI.sendMessage(apiMessages, aiSettings);
        
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          type: type as any,
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setChatMessages(finalMessages);
        LocalStorageService.saveChatMessages(currentProject.id, finalMessages);
      }

      // Extract and set generated code
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

  const handleUpdateSettings = (newSettings: AISettings) => {
    setAISettings(newSettings);
    LocalStorageService.saveAISettings(newSettings);
    setCurrentView(currentProject ? 'chat' : 'projects');
    
    toast({
      title: "Settings saved",
      description: "AI configuration has been updated",
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      
      case 'create-project':
        return (
          <CreateProject
            onCreateProject={handleCreateProject}
            onBack={() => setCurrentView('projects')}
          />
        );
      
      case 'chat':
        return currentProject ? (
          <div className="flex h-full">
            <div className="flex-1 flex flex-col">
              <ChatView
                messages={chatMessages}
                onSendMessage={handleSendMessage}
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
        ) : null;
      
      case 'settings':
        return (
          <SettingsPage
            settings={aiSettings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => setCurrentView(currentProject ? 'chat' : 'projects')}
          />
        );
      
      case 'workflow':
        return <WorkflowSection />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        currentProject={currentProject?.name}
        onCreateProject={() => setCurrentView('create-project')}
        onOpenSettings={() => setCurrentView('settings')}
        onOpenWorkflow={() => setCurrentView('workflow')}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;

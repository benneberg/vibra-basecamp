import { Header } from "@/components/Layout/Header";
import { useAppState } from "@/hooks/useAppState";
import { useProjects } from "@/hooks/useProjects";
import { ProjectList } from "@/components/ProjectManagement/ProjectList";
import { CreateProject } from "@/components/ProjectManagement/CreateProject";
import { ChatContainer } from "@/components/Chat/ChatContainer";
import { SettingsPage } from "@/components/Settings/SettingsPage";
import { WorkflowSection } from "@/components/Workflow/WorkflowSection";
import { LocalStorageService } from "@/services/localStorage";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const AppLayout = () => {
  const { currentView, navigateToProjects, navigateToCreateProject, navigateToChat, navigateToSettings, navigateToWorkflow } = useAppState();
  const { projects, currentProject, createProject, selectProject, deleteProject } = useProjects();
  const [aiSettings, setAISettings] = useState(LocalStorageService.getAISettings());
  const { toast } = useToast();

  useEffect(() => {
    if (currentProject) {
      navigateToChat();
    }
  }, [currentProject, navigateToChat]);

  const handleCreateProject = async (name: string, description?: string) => {
    await createProject(name, description);
    navigateToChat();
  };

  const handleSelectProject = (project: any) => {
    selectProject(project);
    navigateToChat();
  };

  const handleUpdateSettings = (newSettings: any) => {
    setAISettings(newSettings);
    LocalStorageService.saveAISettings(newSettings);
    navigateToChat();
    
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
            onDeleteProject={deleteProject}
          />
        );
      
      case 'create-project':
        return (
          <CreateProject
            onCreateProject={handleCreateProject}
            onBack={navigateToProjects}
          />
        );
      
      case 'chat':
        return currentProject ? (
          <ChatContainer
            projectId={currentProject.id}
            aiSettings={aiSettings}
          />
        ) : null;
      
      case 'settings':
        return (
          <SettingsPage
            settings={aiSettings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => currentProject ? navigateToChat() : navigateToProjects()}
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
        onCreateProject={navigateToCreateProject}
        onOpenSettings={navigateToSettings}
        onOpenWorkflow={navigateToWorkflow}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </main>
    </div>
  );
};
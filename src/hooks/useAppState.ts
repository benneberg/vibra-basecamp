import { useState } from "react";
import { AppView } from "@/types";

export const useAppState = () => {
  const [currentView, setCurrentView] = useState<AppView>('projects');

  const navigateToProjects = () => setCurrentView('projects');
  const navigateToCreateProject = () => setCurrentView('create-project');
  const navigateToChat = () => setCurrentView('chat');
  const navigateToSettings = () => setCurrentView('settings');
  const navigateToWorkflow = () => setCurrentView('workflow');

  return {
    currentView,
    navigateToProjects,
    navigateToCreateProject,
    navigateToChat,
    navigateToSettings,
    navigateToWorkflow,
  };
};
import { useState, useEffect } from "react";
import { LocalStorageService } from "@/services/localStorage";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadedProjects = LocalStorageService.getProjects();
    setProjects(loadedProjects);
    
    const currentProjectData = LocalStorageService.getCurrentProject();
    if (currentProjectData) {
      setCurrentProject(currentProjectData);
    }
  }, []);

  const createProject = async (name: string, description?: string) => {
    try {
      const newProject = LocalStorageService.createProject(name, description);
      setProjects(prev => [newProject, ...prev.filter(p => p.id !== newProject.id)]);
      setCurrentProject(newProject);
      LocalStorageService.setCurrentProject(newProject.id);
      
      toast({
        title: "Project created!",
        description: `${name} is ready for development`,
      });
      
      return newProject;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      throw error;
    }
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    LocalStorageService.setCurrentProject(project.id);
  };

  const deleteProject = (projectId: string) => {
    LocalStorageService.deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    
    toast({
      title: "Project deleted",
      description: "Project and all its data have been removed",
    });
  };

  return {
    projects,
    currentProject,
    createProject,
    selectProject,
    deleteProject,
  };
};
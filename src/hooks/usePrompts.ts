import { useState, useEffect } from "react";
import { PromptTemplate, PromptTag } from "@/types";
import { PromptService } from "@/services/promptService";
import { useToast } from "@/hooks/use-toast";

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [tags, setTags] = useState<PromptTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const loadedPrompts = PromptService.getPrompts();
      const loadedTags = PromptService.getTags();
      setPrompts(loadedPrompts);
      setTags(loadedTags);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'lastModified'>) => {
    try {
      const newPrompt = PromptService.createPrompt(promptData);
      setPrompts(prev => [newPrompt, ...prev]);
      
      toast({
        title: "Prompt Created",
        description: `"${promptData.title}" has been saved`,
      });
      
      return newPrompt;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePrompt = (id: string, updates: Partial<PromptTemplate>) => {
    try {
      PromptService.updatePrompt(id, updates);
      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, lastModified: new Date() } : p
      ));
      
      toast({
        title: "Prompt Updated",
        description: "Changes have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
    }
  };

  const deletePrompt = (id: string) => {
    try {
      PromptService.deletePrompt(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Prompt Deleted",
        description: "Prompt has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = (id: string) => {
    try {
      PromptService.toggleFavorite(id);
      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, isFavorite: !p.isFavorite, lastModified: new Date() } : p
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle favorite",
        variant: "destructive",
      });
    }
  };

  const createTag = (name: string, color: string) => {
    try {
      const newTag = PromptService.createTag(name, color);
      setTags(prev => [...prev, newTag]);
      
      toast({
        title: "Tag Created",
        description: `Tag "${name}" has been created`,
      });
      
      return newTag;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTag = (id: string) => {
    try {
      PromptService.deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Tag Deleted",
        description: "Tag has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  return {
    prompts,
    tags,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    createTag,
    deleteTag,
    refreshData: loadData,
  };
};
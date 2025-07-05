import { useState } from "react";
import { PromptTemplate, AISettings } from "@/types";
import { usePrompts } from "@/hooks/usePrompts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptLibrary } from "./PromptLibrary";
import { PromptEditor } from "./PromptEditor";
import { PromptGenerator } from "./PromptGenerator";
import { BookOpen, Plus, Library, Edit, Sparkles } from "lucide-react";

interface PromptEngineeringProps {
  aiSettings: AISettings;
}

export const PromptEngineering = ({ aiSettings }: PromptEngineeringProps) => {
  const { prompts, tags, loading, createPrompt, updatePrompt, deletePrompt, toggleFavorite, createTag } = usePrompts();
  const [currentView, setCurrentView] = useState<'library' | 'editor' | 'generator'>('library');
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | undefined>();

  const handleCreateNew = () => {
    setEditingPrompt(undefined);
    setCurrentView('editor');
  };

  const handleGeneratePrompt = () => {
    setCurrentView('generator');
  };

  const handleEdit = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt);
    setCurrentView('editor');
  };

  const handleSave = (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'lastModified'>) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, promptData);
    } else {
      createPrompt(promptData);
    }
    setCurrentView('library');
    setEditingPrompt(undefined);
  };

  const handleCancel = () => {
    setCurrentView('library');
    setEditingPrompt(undefined);
  };

  const handleGeneratedPromptSave = (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'lastModified'>) => {
    createPrompt(promptData);
    setCurrentView('library');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-glow" />
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-accent animate-glow" />
              <div>
                <CardTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
                  Prompt Engineering
                </CardTitle>
                <p className="text-muted-foreground">
                  Create, manage, and organize your AI prompts
                </p>
              </div>
            </div>
            {currentView === 'library' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePrompt}
                  className="glass-hover"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
                <Button
                  onClick={handleCreateNew}
                  className="glass-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Prompt
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {prompts.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Prompts
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {prompts.filter(p => p.isFavorite).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Favorites
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {tags.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Tags
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {currentView === 'library' ? (
        <PromptLibrary
          prompts={prompts}
          tags={tags}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={toggleFavorite}
        />
      ) : currentView === 'editor' ? (
        <PromptEditor
          prompt={editingPrompt}
          tags={tags}
          onSave={handleSave}
          onCancel={handleCancel}
          onCreateTag={createTag}
        />
      ) : (
        <PromptGenerator
          aiSettings={aiSettings}
          tags={tags}
          onSave={handleGeneratedPromptSave}
          onCancel={handleCancel}
          onCreateTag={createTag}
        />
      )}
    </div>
  );
};
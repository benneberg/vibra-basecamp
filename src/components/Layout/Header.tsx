import { Code2, Settings, Plus, Workflow, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentProject?: string;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onOpenWorkflow: () => void;
  onNavigateHome: () => void;
  onOpenPrompts: () => void;
}

export const Header = ({ currentProject, onCreateProject, onOpenSettings, onOpenWorkflow, onNavigateHome, onOpenPrompts }: HeaderProps) => {
  return (
    <header className="glass border-b border-glass-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
          <Code2 className="w-8 h-8 text-primary animate-glow" />
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            AI Developer Toolbox
          </h1>
        </div>
        {currentProject && (
          <div className="text-sm text-muted-foreground">
            / {currentProject}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateHome}
          className="glass-hover"
        >
          <Home className="w-4 h-4 mr-2" />
          Projects
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenPrompts}
          className="glass-hover"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Prompts
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenWorkflow}
          className="glass-hover"
        >
          <Workflow className="w-4 h-4 mr-2" />
          Workflow
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateProject}
          className="glass-hover"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="glass-hover"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
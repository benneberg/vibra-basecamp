import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, FileText, Code, Palette, Book, Rocket, ArrowRight, CheckCircle } from "lucide-react";
import { WorkflowChat } from "./WorkflowChat";

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  systemPrompt: string;
  completed?: boolean;
}

const workflowStages: WorkflowStage[] = [
  {
    id: 'ideation',
    title: 'Brainstorm & Ideation',
    description: 'Generate ideas, research trends, and explore possibilities',
    icon: Lightbulb,
    color: 'text-yellow-400',
    systemPrompt: `You are an expert brainstorming assistant specializing in product ideation and trend analysis. Help users generate innovative ideas, research market trends, identify opportunities, and refine concepts. Focus on creativity, market viability, and user needs. Provide actionable insights and encourage exploration of different angles.`
  },
  {
    id: 'specification',
    title: 'Project Specification',
    description: 'Define requirements, technologies, and project structure',
    icon: FileText,
    color: 'text-blue-400',
    systemPrompt: `You are a technical product specification expert. Help users transform ideas into detailed project specifications including: product descriptions, technology stack recommendations, feature lists, system architecture, integrations, database design, and development roadmap. Create comprehensive documentation similar to detailed README files.`
  },
  {
    id: 'development',
    title: 'Code Development',
    description: 'Generate code, implement features, and handle integrations',
    icon: Code,
    color: 'text-green-400',
    systemPrompt: `You are an expert full-stack developer. Help users implement their specifications by generating clean, production-ready code, explaining implementation approaches, handling API integrations, debugging issues, and following best practices. Focus on maintainable, scalable code architecture.`
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    description: 'Create beautiful interfaces and user experiences',
    icon: Palette,
    color: 'text-purple-400',
    systemPrompt: `You are a UI/UX design expert. Help users create beautiful, functional interfaces by generating HTML/CSS, recommending design systems, creating responsive layouts, optimizing user flows, and ensuring accessibility. Focus on modern design principles and user experience best practices.`
  },
  {
    id: 'documentation',
    title: 'Content & Documentation',
    description: 'Generate docs, manuals, marketing content, and guides',
    icon: Book,
    color: 'text-orange-400',
    systemPrompt: `You are a technical writing and content creation expert. Help users create comprehensive documentation, user manuals, API docs, marketing copy, tutorials, and educational content. Focus on clarity, structure, and audience-appropriate language.`
  },
  {
    id: 'launch',
    title: 'Deployment & Growth',
    description: 'Deploy, monetize, and scale your product',
    icon: Rocket,
    color: 'text-red-400',
    systemPrompt: `You are a business and deployment expert. Help users with deployment strategies, hosting solutions, monetization models, marketing approaches, scaling considerations, and growth tactics. Provide practical advice for launching and growing digital products.`
  }
];

export const WorkflowSection = () => {
  const [activeStage, setActiveStage] = useState<WorkflowStage | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  const handleStageComplete = (stageId: string) => {
    setCompletedStages(prev => new Set([...prev, stageId]));
  };

  const handleBackToOverview = () => {
    setActiveStage(null);
  };

  if (activeStage) {
    return (
      <WorkflowChat
        stage={activeStage}
        onBack={handleBackToOverview}
        onComplete={() => handleStageComplete(activeStage.id)}
        isCompleted={completedStages.has(activeStage.id)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
          AI Workflow Pipeline
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your ideas into reality with our guided AI-powered development workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflowStages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = completedStages.has(stage.id);
          const isNext = index === 0 || completedStages.has(workflowStages[index - 1]?.id);

          return (
            <Card
              key={stage.id}
              className={`p-6 glass cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                isCompleted 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : isNext 
                    ? 'border-primary/30 hover:border-primary/50' 
                    : 'border-glass-border opacity-60'
              }`}
              onClick={() => setActiveStage(stage)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg glass ${stage.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{stage.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {stage.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge 
                  variant={isCompleted ? "default" : isNext ? "secondary" : "outline"}
                  className={isCompleted ? "bg-green-500/20 text-green-400" : ""}
                >
                  {isCompleted ? "Completed" : isNext ? "Ready" : "Locked"}
                </Badge>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 glass rounded-lg border border-glass-border">
        <h2 className="text-xl font-semibold mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Sequential Flow:</strong> Each stage builds upon the previous one, creating a logical development progression.
          </div>
          <div>
            <strong className="text-foreground">2. Specialized AI:</strong> Each stage uses AI optimized for specific tasks with tailored prompts and expertise.
          </div>
          <div>
            <strong className="text-foreground">3. Seamless Handoff:</strong> Copy outputs from one stage to feed into the next for continuous workflow.
          </div>
        </div>
      </div>
    </div>
  );
};
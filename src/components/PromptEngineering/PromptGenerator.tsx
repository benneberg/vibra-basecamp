import { useState } from "react";
import { PromptTemplate, PromptTag, AISettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, X, Plus, Tag, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GroqAPIService } from "@/services/groqAPI";

interface PromptGeneratorProps {
  aiSettings: AISettings;
  tags: PromptTag[];
  onSave: (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'lastModified'>) => void;
  onCancel: () => void;
  onCreateTag: (name: string, color: string) => void;
}

const TARGET_MODELS = [
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'llama-3.1-70b',
  'llama-3.1-8b',
  'gemini-pro',
  'custom'
];

const TAG_COLORS = [
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
  'hsl(260 100% 70%)',
  'hsl(120 100% 70%)',
  'hsl(30 100% 70%)',
  'hsl(300 100% 70%)',
];

export const PromptGenerator = ({ aiSettings, tags, onSave, onCancel, onCreateTag }: PromptGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    tags: [] as string[],
    type: 'user' as 'user' | 'system',
    targetModel: 'gpt-4',
    description: '',
    content: '',
    isFavorite: false,
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const { toast } = useToast();

  const generatePrompt = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what you want the prompt to do",
        variant: "destructive",
      });
      return;
    }

    if (!aiSettings.apiKey) {
      toast({
        title: "API Key required",
        description: "Please configure your AI settings first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = `You are an expert prompt engineer. Generate an optimized ${formData.type} prompt for the ${formData.targetModel} model based on the user's description. 

Guidelines:
- Make the prompt clear, specific, and actionable
- Include relevant context and constraints
- Use best practices for the specified model
- For system prompts: Define the AI's role, behavior, and capabilities
- For user prompts: Structure the request clearly with examples if helpful
- Optimize for the target model's strengths and limitations

Return only the generated prompt without additional explanation.`;

      const userPrompt = `Generate a prompt for: ${description}

Target Model: ${formData.targetModel}
Prompt Type: ${formData.type}`;

      const groqService = new GroqAPIService();
      const response = await groqService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], aiSettings);

      setGeneratedPrompt(response);
      setFormData(prev => ({
        ...prev,
        content: response,
        description: description,
        title: description.slice(0, 50) + (description.length > 50 ? '...' : '')
      }));

      toast({
        title: "Prompt generated!",
        description: "Review and edit the generated prompt before saving",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate prompt. Check your AI settings.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const improvePrompt = async () => {
    if (!generatedPrompt.trim() || !description.trim()) return;

    setIsGenerating(true);
    try {
      const systemPrompt = `You are an expert prompt engineer. Improve the existing prompt based on the user's feedback. Keep the core functionality but enhance clarity, specificity, and effectiveness.

Target Model: ${formData.targetModel}
Prompt Type: ${formData.type}

Return only the improved prompt without additional explanation.`;

      const userPrompt = `Current prompt:
${generatedPrompt}

Original requirement: ${description}

Please improve this prompt to be more effective, clear, and optimized for ${formData.targetModel}.`;

      const groqService = new GroqAPIService();
      const response = await groqService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], aiSettings);

      setGeneratedPrompt(response);
      setFormData(prev => ({ ...prev, content: response }));

      toast({
        title: "Prompt improved!",
        description: "The prompt has been refined based on best practices",
      });
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve prompt. Check your AI settings.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and ensure the prompt content is generated",
        variant: "destructive",
      });
      return;
    }
    
    onSave(formData);
  };

  const addTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
  };

  const removeTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagName)
    }));
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setIsTagDialogOpen(false);
    }
  };

  return (
    <Card className="glass max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent animate-glow" />
            AI Prompt Generator
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="glass-hover"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim()}
              className="glass-hover"
            >
              Save Prompt
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Describe Your Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">What should this prompt do? *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task, context, and desired output for your prompt..."
                    className="glass font-mono"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'user' | 'system') => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User Prompt</SelectItem>
                        <SelectItem value="system">System Prompt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Model</Label>
                    <Select
                      value={formData.targetModel}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, targetModel: value }))
                      }
                    >
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_MODELS.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generatePrompt}
                  disabled={!description.trim() || isGenerating}
                  className="w-full glass-hover"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Prompt
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Prompt Section */}
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Generated Prompt
                  {generatedPrompt && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="glass-hover"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={improvePrompt}
                        disabled={isGenerating}
                        className="glass-hover"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPrompt ? (
                  <div className="bg-card/50 rounded-md p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {generatedPrompt}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generate a prompt to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prompt Details */}
        {generatedPrompt && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Prompt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Prompt Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter prompt title..."
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promptDescription">Description</Label>
                <Input
                  id="promptDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this prompt does..."
                  className="glass"
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="glass-hover">
                        <Plus className="w-4 h-4 mr-2" />
                        New Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass">
                      <DialogHeader>
                        <DialogTitle>Create New Tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tagName">Tag Name</Label>
                          <Input
                            id="tagName"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Enter tag name..."
                            className="glass"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            {TAG_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewTagColor(color)}
                                className={`w-8 h-8 rounded-full border-2 ${
                                  newTagColor === color ? 'border-primary' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleCreateTag} className="w-full">
                          Create Tag
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Available Tags */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Available Tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={formData.tags.includes(tag.name) ? "default" : "outline"}
                        className="cursor-pointer glass-hover"
                        style={{ 
                          borderColor: tag.color,
                          backgroundColor: formData.tags.includes(tag.name) ? tag.color : 'transparent',
                          color: formData.tags.includes(tag.name) ? 'white' : tag.color
                        }}
                        onClick={() => 
                          formData.tags.includes(tag.name) 
                            ? removeTag(tag.name) 
                            : addTag(tag.name)
                        }
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Selected Tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tagName => {
                        const tag = tags.find(t => t.name === tagName);
                        return (
                          <Badge
                            key={tagName}
                            variant="default"
                            className="cursor-pointer"
                            style={{ backgroundColor: tag?.color }}
                            onClick={() => removeTag(tagName)}
                          >
                            {tagName}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
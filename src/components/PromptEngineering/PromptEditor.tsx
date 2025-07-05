import { useState, useEffect } from "react";
import { PromptTemplate, PromptTag } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, X, Plus, Tag, Palette } from "lucide-react";

interface PromptEditorProps {
  prompt?: PromptTemplate;
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

export const PromptEditor = ({ prompt, tags, onSave, onCancel, onCreateTag }: PromptEditorProps) => {
  const [formData, setFormData] = useState({
    title: '',
    tags: [] as string[],
    type: 'user' as 'user' | 'system',
    targetModel: 'gpt-4',
    description: '',
    content: '',
    isFavorite: false,
  });

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        tags: [...prompt.tags],
        type: prompt.type,
        targetModel: prompt.targetModel,
        description: prompt.description,
        content: prompt.content,
        isFavorite: prompt.isFavorite,
      });
    }
  }, [prompt]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
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

  const isFormValid = formData.title.trim() && formData.content.trim();

  return (
    <Card className="glass max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {prompt ? 'Edit Prompt' : 'Create New Prompt'}
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
              disabled={!isFormValid}
              className="glass-hover"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this prompt does..."
            className="glass"
          />
        </div>

        {/* Type and Target Model */}
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

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Prompt Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your prompt content here..."
            className="glass font-mono"
            rows={12}
          />
          <div className="text-xs text-muted-foreground">
            {formData.content.length} characters
          </div>
        </div>

        {/* Preview */}
        {formData.content && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {formData.content}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
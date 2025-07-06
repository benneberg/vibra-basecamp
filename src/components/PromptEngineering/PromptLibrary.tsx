import { useState, useMemo } from "react";
import { PromptTemplate, PromptTag } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Search, Edit, Trash2, Copy, Tag, Filter, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptLibraryProps {
  prompts: PromptTemplate[];
  tags: PromptTag[];
  onEdit: (prompt: PromptTemplate) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOptimize: (prompt: PromptTemplate) => void;
}

export const PromptLibrary = ({ prompts, tags, onEdit, onDelete, onToggleFavorite, onOptimize }: PromptLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Search filter
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tag filter
      const matchesTag = selectedTag === "all" || prompt.tags.includes(selectedTag);
      
      // Type filter
      const matchesType = selectedType === "all" || prompt.type === selectedType;
      
      // Model filter
      const matchesModel = selectedModel === "all" || prompt.targetModel === selectedModel;
      
      // Favorites filter
      const matchesFavorites = !showFavoritesOnly || prompt.isFavorite;
      
      return matchesSearch && matchesTag && matchesType && matchesModel && matchesFavorites;
    });
  }, [prompts, searchQuery, selectedTag, selectedType, selectedModel, showFavoritesOnly]);

  const uniqueModels = useMemo(() => {
    const models = [...new Set(prompts.map(p => p.targetModel))];
    return models.sort();
  }, [prompts]);

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `"${title}" prompt copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || 'hsl(var(--muted))';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="glass-hover"
            >
              <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    <span className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Filter by model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
          </h3>
        </div>

        <div className="grid gap-4">
          {filteredPrompts.map(prompt => (
            <Card key={prompt.id} className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {prompt.title}
                      <Badge variant="outline" className="text-xs">
                        {prompt.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {prompt.targetModel}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {prompt.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(prompt.id)}
                      className="glass-hover"
                    >
                      <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.content, prompt.title)}
                      className="glass-hover"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOptimize(prompt)}
                      className="glass-hover"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(prompt)}
                      className="glass-hover"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(prompt.id)}
                      className="glass-hover text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map(tagName => (
                      <Badge 
                        key={tagName} 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: getTagColor(tagName),
                          color: getTagColor(tagName)
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tagName}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Content Preview */}
                  <div className="bg-card/50 rounded-md p-3">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                      {prompt.content.length > 200 
                        ? `${prompt.content.substring(0, 200)}...` 
                        : prompt.content
                      }
                    </pre>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Modified: {prompt.lastModified.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
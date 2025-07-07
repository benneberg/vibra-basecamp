import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Github, 
  Globe, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Copy,
  Loader2,
  CheckCircle,
  XCircle,
  Upload
} from "lucide-react";
import { ContextSource, ContextChunk } from "@/types";
import { ContextService } from "@/services/contextService";
import { useToast } from "@/hooks/use-toast";

interface ContextManagerProps {
  contextSources: ContextSource[];
  onContextSourcesChange: (sources: ContextSource[]) => void;
}

export const ContextManager = ({ contextSources, onContextSourcesChange }: ContextManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddGitHub = async () => {
    if (!githubUrl.trim()) return;
    
    setIsLoading(true);
    try {
      const contextSource = await ContextService.fetchGitHubRepo(githubUrl);
      onContextSourcesChange([...contextSources, contextSource]);
      setGithubUrl("");
      setIsAddDialogOpen(false);
      toast({
        title: "GitHub repository added",
        description: `${contextSource.chunks.length} code chunks processed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!webUrl.trim()) return;
    
    setIsLoading(true);
    try {
      const contextSource = await ContextService.fetchUrl(webUrl);
      onContextSourcesChange([...contextSources, contextSource]);
      setWebUrl("");
      setIsAddDialogOpen(false);
      toast({
        title: "Web page added",
        description: `${contextSource.chunks.length} content chunks processed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch web page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    try {
      const newSources: ContextSource[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: "destructive",
          });
          continue;
        }
        
        const contextSource = await ContextService.processFile(file);
        newSources.push(contextSource);
      }
      
      if (newSources.length > 0) {
        onContextSourcesChange([...contextSources, ...newSources]);
        setIsAddDialogOpen(false);
        toast({
          title: "Files processed",
          description: `${newSources.length} file(s) added to context`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSource = (sourceId: string) => {
    onContextSourcesChange(contextSources.filter(s => s.id !== sourceId));
    toast({
      title: "Context removed",
      description: "Context source has been removed from the project",
    });
  };

  const handleRefreshSource = async (sourceId: string) => {
    const source = contextSources.find(s => s.id === sourceId);
    if (!source) return;

    setIsLoading(true);
    try {
      let updatedSource: ContextSource;
      
      if (source.type === 'github') {
        updatedSource = await ContextService.fetchGitHubRepo(source.source);
      } else if (source.type === 'url') {
        updatedSource = await ContextService.fetchUrl(source.source);
      } else {
        throw new Error('Cannot refresh file-based context');
      }
      
      updatedSource.id = sourceId; // Keep the same ID
      onContextSourcesChange(contextSources.map(s => s.id === sourceId ? updatedSource : s));
      toast({
        title: "Context refreshed",
        description: `${updatedSource.chunks.length} chunks updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh context",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyChunkToClipboard = (chunk: ContextChunk) => {
    navigator.clipboard.writeText(chunk.content);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const getStatusIcon = (status: ContextSource['status']) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getTypeIcon = (type: ContextSource['type']) => {
    switch (type) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'url': return <Globe className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
    }
  };

  const totalChunks = contextSources.reduce((acc, source) => acc + source.chunks.length, 0);
  const totalTokens = contextSources.reduce((acc, source) => 
    acc + source.chunks.reduce((chunkAcc, chunk) => chunkAcc + chunk.tokens, 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Context</h3>
          <p className="text-sm text-muted-foreground">
            {totalChunks} chunks • ~{totalTokens.toLocaleString()} tokens
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Context
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-glass-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Context Sources</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="github" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger value="github">GitHub</TabsTrigger>
                <TabsTrigger value="url">Web URL</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              
              <TabsContent value="github" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">GitHub Repository URL</label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="glass mt-1"
                  />
                </div>
                <Button 
                  onClick={handleAddGitHub} 
                  disabled={!githubUrl.trim() || isLoading}
                  className="w-full gradient-primary"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
                  Add Repository
                </Button>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Web Page URL</label>
                  <Input
                    placeholder="https://docs.example.com/guide"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="glass mt-1"
                  />
                </div>
                <Button 
                  onClick={handleAddUrl} 
                  disabled={!webUrl.trim() || isLoading}
                  className="w-full gradient-primary"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                  Add Web Page
                </Button>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Upload Documents</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-glass-border border-dashed rounded-md glass">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="flex text-sm text-muted-foreground">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-glow">
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".pdf,.md,.txt,.docx"
                            onChange={(e) => handleFileUpload(e.target.files)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PDF, MD, TXT, DOCX up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Context Sources List */}
      <div className="space-y-3">
        {contextSources.map((source) => (
          <Card key={source.id} className="glass border-glass-border">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(source.type)}
                  <div>
                    <h4 className="font-medium">{source.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {source.chunks.length} chunks • {source.chunks.reduce((acc, chunk) => acc + chunk.tokens, 0)} tokens
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(source.status)}
                  
                  {source.type !== 'file' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshSource(source.id)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSource(expandedSource === source.id ? null : source.id)}
                  >
                    {expandedSource === source.id ? 'Hide' : 'Show'} Chunks
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSource(source.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {expandedSource === source.id && source.chunks.length > 0 && (
                <div className="mt-4 border-t border-glass-border pt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {source.chunks.map((chunk) => (
                        <Card key={chunk.id} className="p-3 glass">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {chunk.metadata.type}
                                </Badge>
                                {chunk.metadata.language && (
                                  <Badge variant="outline" className="text-xs">
                                    {chunk.metadata.language}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {chunk.tokens} tokens
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground font-mono bg-muted/20 p-2 rounded max-h-20 overflow-hidden">
                                {chunk.content.substring(0, 200)}
                                {chunk.content.length > 200 && '...'}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyChunkToClipboard(chunk)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {contextSources.length === 0 && (
          <Card className="glass border-glass-border p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Context Sources</h3>
            <p className="text-muted-foreground mb-4">
              Add GitHub repositories, web pages, or upload documents to provide context for AI conversations.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Context Source
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
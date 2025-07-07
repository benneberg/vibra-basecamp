import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Eye, Copy, Download, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CodeArtifactProps {
  html?: string;
  css?: string;
  js?: string;
  isVisible?: boolean;
}

export const CodeArtifact = ({ html, css, js, isVisible = true }: CodeArtifactProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js'>('html');
  const { toast } = useToast();

  if (!isVisible || (!html && !css && !js)) return null;

  const generatePreviewContent = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
        }
        ${css || ''}
    </style>
</head>
<body>
    ${html || '<p>No HTML content provided</p>'}
    <script>
        ${js || ''}
    </script>
</body>
</html>`;
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: `${type} code has been copied`,
    });
  };

  const downloadCode = () => {
    const content = generatePreviewContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "HTML file has been downloaded",
    });
  };

  const codeFiles = [
    { key: 'html' as const, label: 'HTML', content: html, language: 'html' },
    { key: 'css' as const, label: 'CSS', content: css, language: 'css' },
    { key: 'js' as const, label: 'JavaScript', content: js, language: 'javascript' },
  ].filter(file => file.content);

  return (
    <Card className="glass border-glass-border overflow-hidden">
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Generated Code</h3>
            <Badge variant="secondary" className="text-xs">
              Artifact
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
            >
              {activeTab === 'preview' ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {activeTab === 'preview' ? 'Code' : 'Preview'}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={downloadCode}>
              <Download className="w-4 h-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-glass-border max-w-6xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Code Artifact - Full View</DialogTitle>
                </DialogHeader>
                <div className="h-[70vh]">
                  <CodeArtifactContent 
                    activeTab={activeTab}
                    activeCodeTab={activeCodeTab}
                    setActiveCodeTab={setActiveCodeTab}
                    codeFiles={codeFiles}
                    generatePreviewContent={generatePreviewContent}
                    copyToClipboard={copyToClipboard}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="h-64">
        <CodeArtifactContent 
          activeTab={activeTab}
          activeCodeTab={activeCodeTab}
          setActiveCodeTab={setActiveCodeTab}
          codeFiles={codeFiles}
          generatePreviewContent={generatePreviewContent}
          copyToClipboard={copyToClipboard}
        />
      </div>
    </Card>
  );
};

interface CodeArtifactContentProps {
  activeTab: 'preview' | 'code';
  activeCodeTab: 'html' | 'css' | 'js';
  setActiveCodeTab: (tab: 'html' | 'css' | 'js') => void;
  codeFiles: Array<{ key: 'html' | 'css' | 'js'; label: string; content: string | undefined; language: string }>;
  generatePreviewContent: () => string;
  copyToClipboard: (content: string, type: string) => void;
}

const CodeArtifactContent = ({ 
  activeTab, 
  activeCodeTab, 
  setActiveCodeTab, 
  codeFiles, 
  generatePreviewContent, 
  copyToClipboard 
}: CodeArtifactContentProps) => {
  return (
    <Tabs value={activeTab} className="h-full">
      <TabsContent value="preview" className="h-full mt-0">
        <iframe
          srcDoc={generatePreviewContent()}
          className="w-full h-full border-0 bg-white rounded-md"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </TabsContent>
      
      <TabsContent value="code" className="h-full mt-0">
        <div className="h-full flex flex-col">
          <div className="flex border-b border-glass-border">
            {codeFiles.map((file) => (
              <button
                key={file.key}
                onClick={() => setActiveCodeTab(file.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeCodeTab === file.key
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
              >
                {file.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1 relative">
            {codeFiles.map((file) => (
              activeCodeTab === file.key && (
                <div key={file.key} className="h-full relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(file.content || '', file.label)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <pre className="h-full overflow-auto p-4 text-sm bg-muted/20 font-mono">
                    <code className={`language-${file.language}`}>
                      {file.content}
                    </code>
                  </pre>
                </div>
              )
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
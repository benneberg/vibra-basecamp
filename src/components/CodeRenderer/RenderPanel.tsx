import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Download, Eye, Code, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RenderPanelProps {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  isVisible: boolean;
  onClose?: () => void;
}

export const RenderPanel = ({ htmlCode, cssCode, jsCode, isVisible, onClose }: RenderPanelProps) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const generatePreviewContent = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            background: #f8fafc;
        }
        ${cssCode || ''}
    </style>
</head>
<body>
    ${htmlCode || '<p>No HTML content to preview</p>'}
    <script>
        ${jsCode || ''}
        
        // Error handling
        window.addEventListener('error', function(e) {
            console.error('Preview Error:', e.error);
        });
    </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    if (iframeRef.current && (htmlCode || cssCode || jsCode)) {
      const content = generatePreviewContent();
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [htmlCode, cssCode, jsCode]);

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${type} code copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    const content = generatePreviewContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-code.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  const hasContent = htmlCode || cssCode || jsCode;

  return (
    <Card className={`glass ${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            Code Renderer
            {hasContent && (
              <Badge variant="secondary" className="glass text-xs">
                Live Preview
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasContent && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadCode}
                  className="glass-hover"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="glass-hover"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="glass-hover"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {!hasContent ? (
          <div className="p-8 text-center">
            <Code className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Code Generated</h3>
            <p className="text-muted-foreground">
              Ask the AI to generate HTML, CSS, or JavaScript code to see a live preview here.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full justify-start glass border-b rounded-none">
              <TabsTrigger value="preview">
                <Play className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              {htmlCode && (
                <TabsTrigger value="html">
                  HTML
                  <Badge variant="outline" className="ml-2 text-xs">
                    {htmlCode.split('\n').length}
                  </Badge>
                </TabsTrigger>
              )}
              {cssCode && (
                <TabsTrigger value="css">
                  CSS
                  <Badge variant="outline" className="ml-2 text-xs">
                    {cssCode.split('\n').length}
                  </Badge>
                </TabsTrigger>
              )}
              {jsCode && (
                <TabsTrigger value="js">
                  JavaScript
                  <Badge variant="outline" className="ml-2 text-xs">
                    {jsCode.split('\n').length}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="preview" className="h-full mt-0">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-white rounded-b-lg"
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </TabsContent>

            {htmlCode && (
              <TabsContent value="html" className="h-full mt-0">
                <div className="relative h-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(htmlCode, "HTML")}
                    className="absolute top-2 right-2 z-10 glass"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <pre className="h-full overflow-auto p-4 text-sm bg-card/50 font-mono">
                    <code className="language-html">{htmlCode}</code>
                  </pre>
                </div>
              </TabsContent>
            )}

            {cssCode && (
              <TabsContent value="css" className="h-full mt-0">
                <div className="relative h-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cssCode, "CSS")}
                    className="absolute top-2 right-2 z-10 glass"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <pre className="h-full overflow-auto p-4 text-sm bg-card/50 font-mono">
                    <code className="language-css">{cssCode}</code>
                  </pre>
                </div>
              </TabsContent>
            )}

            {jsCode && (
              <TabsContent value="js" className="h-full mt-0">
                <div className="relative h-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(jsCode, "JavaScript")}
                    className="absolute top-2 right-2 z-10 glass"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <pre className="h-full overflow-auto p-4 text-sm bg-card/50 font-mono">
                    <code className="language-javascript">{jsCode}</code>
                  </pre>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
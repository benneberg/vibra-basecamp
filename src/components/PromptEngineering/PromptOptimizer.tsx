import { useState } from "react";
import { PromptTemplate, AISettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Copy, Loader2, RefreshCw } from "lucide-react";
import { GroqAPIService } from "@/services/groqAPI";
import { useToast } from "@/hooks/use-toast";

interface PromptOptimizerProps {
  prompt: PromptTemplate;
  aiSettings: AISettings;
  onOptimizedPromptSave: (content: string) => void;
  onClose: () => void;
}

export const PromptOptimizer = ({ prompt, aiSettings, onOptimizedPromptSave, onClose }: PromptOptimizerProps) => {
  const [optimizationRequest, setOptimizationRequest] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimization, setHasOptimization] = useState(false);
  const { toast } = useToast();
  const groqAPI = new GroqAPIService();

  const handleOptimize = async () => {
    if (!optimizationRequest.trim()) return;

    setIsOptimizing(true);
    try {
      const systemPrompt = `You are an expert prompt engineer. Your task is to optimize prompts for AI models to be more effective, clear, and produce better results.

Target Model: ${prompt.targetModel}
Prompt Type: ${prompt.type}

Current Prompt:
${prompt.content}

Optimization Request:
${optimizationRequest}

Please provide an optimized version of the prompt that:
1. Maintains the original intent and purpose
2. Is optimized for the target model (${prompt.targetModel})
3. Follows best practices for ${prompt.type} prompts
4. Addresses the specific optimization request
5. Is clear, concise, and effective

Return ONLY the optimized prompt content, no explanations or markdown formatting.`;

      const optimized = await groqAPI.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please optimize this prompt.' }
      ], aiSettings);

      setOptimizedPrompt(optimized);
      setHasOptimization(true);
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Failed to optimize prompt",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopyOptimized = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      toast({
        title: "Copied!",
        description: "Optimized prompt copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSaveOptimized = () => {
    onOptimizedPromptSave(optimizedPrompt);
    toast({
      title: "Prompt updated",
      description: "Your prompt has been updated with the optimized version",
    });
  };

  const handleReoptimize = () => {
    setOptimizedPrompt("");
    setHasOptimization(false);
    setOptimizationRequest("");
  };

  return (
    <Card className="glass max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Optimize Prompt: {prompt.title}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Prompt */}
        <div className="space-y-2">
          <Label>Current Prompt</Label>
          <div className="bg-card/50 rounded-md p-4 border">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {prompt.content}
            </pre>
          </div>
          <div className="text-xs text-muted-foreground">
            Type: {prompt.type} | Target Model: {prompt.targetModel}
          </div>
        </div>

        {/* Optimization Request */}
        {!hasOptimization && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="optimization">How would you like to optimize this prompt?</Label>
              <Textarea
                id="optimization"
                value={optimizationRequest}
                onChange={(e) => setOptimizationRequest(e.target.value)}
                placeholder="e.g., Make it more specific, add examples, improve clarity, optimize for better results, etc."
                className="glass"
                rows={4}
              />
            </div>
            <Button
              onClick={handleOptimize}
              disabled={!optimizationRequest.trim() || isOptimizing}
              className="glass-hover"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize Prompt
                </>
              )}
            </Button>
          </div>
        )}

        {/* Optimized Result */}
        {hasOptimization && (
          <div className="space-y-4">
            <Alert>
              <Sparkles className="w-4 h-4" />
              <AlertDescription>
                Here's your optimized prompt based on: "{optimizationRequest}"
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Optimized Prompt</Label>
              <div className="bg-accent/10 rounded-md p-4 border border-accent/20">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {optimizedPrompt}
                </pre>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveOptimized}
                className="glass-hover"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Use Optimized Version
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyOptimized}
                className="glass-hover"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="secondary"
                onClick={handleReoptimize}
                className="glass-hover"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Different Optimization
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
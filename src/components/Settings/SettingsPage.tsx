import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Key, Brain, Zap } from "lucide-react";

export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableStreaming: boolean;
}

interface SettingsPageProps {
  settings: AISettings;
  onUpdateSettings: (settings: AISettings) => void;
  onBack: () => void;
}

export const SettingsPage = ({ settings, onUpdateSettings, onBack }: SettingsPageProps) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const models = [
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "gemma-7b-it", label: "Gemma 7B" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUpdateSettings(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AISettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="glass-hover -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            AI Settings
          </h1>
        </div>

        {/* API Configuration */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Groq API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={localSettings.apiKey}
                onChange={(e) => updateSetting('apiKey', e.target.value)}
                placeholder="gsk_..."
                className="glass"
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{" "}
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Groq Console
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={localSettings.model} onValueChange={(value) => updateSetting('model', value)}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="glass">
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Model Parameters */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Model Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.temperature}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[localSettings.temperature]}
                onValueChange={([value]) => updateSetting('temperature', value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Controls randomness. Lower values for focused responses, higher for creativity.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.maxTokens.toLocaleString()}
                </span>
              </div>
              <Slider
                id="maxTokens"
                min={100}
                max={8192}
                step={100}
                value={[localSettings.maxTokens]}
                onValueChange={([value]) => updateSetting('maxTokens', value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Maximum length of the AI response in tokens.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="streaming">Enable Streaming</Label>
                <p className="text-sm text-muted-foreground">
                  Stream responses for faster perceived performance
                </p>
              </div>
              <Switch
                id="streaming"
                checked={localSettings.enableStreaming}
                onCheckedChange={(checked) => updateSetting('enableStreaming', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Prompt */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Custom System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={localSettings.systemPrompt}
                onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                placeholder="You are an AI assistant specialized in helping developers..."
                className="glass min-h-[120px]"
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                Define how the AI should behave and respond to your requests.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isSaving}
            className="glass"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gradient-primary hover:opacity-90"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
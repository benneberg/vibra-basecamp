export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableStreaming: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  githubUrl?: string;
  createdAt: Date;
  lastModified: Date;
  messageCount: number;
  contextSources?: ContextSource[];
}

export interface ContextSource {
  id: string;
  type: 'github' | 'url' | 'file';
  source: string;
  title: string;
  status: 'loading' | 'ready' | 'error';
  chunks: ContextChunk[];
  metadata?: {
    fileType?: string;
    size?: number;
    lastFetched?: Date;
  };
}

export interface ContextChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'code' | 'documentation' | 'text';
    language?: string;
    filePath?: string;
    startLine?: number;
    endLine?: number;
  };
  tokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'code' | 'debug' | 'design' | 'documentation';
}

export interface PromptTemplate {
  id: string;
  title: string;
  tags: string[];
  type: 'user' | 'system';
  targetModel: string;
  description: string;
  content: string;
  isFavorite: boolean;
  createdAt: Date;
  lastModified: Date;
}

export interface PromptTag {
  id: string;
  name: string;
  color: string;
}

export type AppView = 'projects' | 'create-project' | 'chat' | 'settings' | 'workflow' | 'prompts';
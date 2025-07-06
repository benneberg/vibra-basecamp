import { Project, ChatMessage, AISettings } from "@/types";

const STORAGE_KEYS = {
  PROJECTS: 'ai-toolbox-projects',
  CHAT_MESSAGES: 'ai-toolbox-chat-messages',
  AI_SETTINGS: 'ai-toolbox-ai-settings',
  CURRENT_PROJECT: 'ai-toolbox-current-project',
} as const;

// Default AI settings
export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'llama3-8b-8192',
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: `You are an expert AI developer assistant specialized in helping with:
- Code generation in multiple programming languages
- Debugging and troubleshooting code issues
- Creating responsive web designs with HTML/CSS
- Writing technical documentation
- Best practices and code optimization

Provide clear, concise, and practical solutions. When generating code, include comments for clarity.`,
  enableStreaming: true,
};

export class LocalStorageService {
  // Projects
  static getProjects(): Project[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!stored) return [];
      
      const projects = JSON.parse(stored);
      return projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        lastModified: new Date(p.lastModified),
      }));
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }


  // Fallback UUID v4 generator
  static uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static createProject(name: string, description?: string, githubUrl?: string): Project {
    const newProject: Project = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : LocalStorageService.uuidv4(),
      name,
      description,
      githubUrl,
      createdAt: new Date(),
      lastModified: new Date(),
      messageCount: 0,
    };

    const projects = this.getProjects();
    projects.unshift(newProject);
    this.saveProjects(projects);
    
    return newProject;
  }

  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    this.saveProjects(projects);
    
    // Also delete chat messages for this project
    localStorage.removeItem(`${STORAGE_KEYS.CHAT_MESSAGES}-${projectId}`);
    
    // Clear current project if it's the deleted one
    if (this.getCurrentProjectId() === projectId) {
      this.setCurrentProject(null);
    }
  }

  static updateProjectMessageCount(projectId: string, count: number): void {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex].messageCount = count;
      projects[projectIndex].lastModified = new Date();
      this.saveProjects(projects);
    }
  }

  // Current Project
  static getCurrentProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  }

  static setCurrentProject(projectId: string | null): void {
    if (projectId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
    }
  }

  static getCurrentProject(): Project | null {
    const projectId = this.getCurrentProjectId();
    if (!projectId) return null;
    
    const projects = this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  // Chat Messages
  static getChatMessages(projectId: string): ChatMessage[] {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.CHAT_MESSAGES}-${projectId}`);
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      return messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  }

  static saveChatMessages(projectId: string, messages: ChatMessage[]): void {
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_MESSAGES}-${projectId}`,
        JSON.stringify(messages)
      );
      
      // Update project message count
      this.updateProjectMessageCount(projectId, messages.length);
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }

  static addChatMessage(projectId: string, message: ChatMessage): void {
    const messages = this.getChatMessages(projectId);
    messages.push(message);
    this.saveChatMessages(projectId, messages);
  }

  // AI Settings
  static getAISettings(): AISettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (!stored) return DEFAULT_AI_SETTINGS;
      
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return DEFAULT_AI_SETTINGS;
    }
  }

  static saveAISettings(settings: AISettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  }

  // Utility
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear project-specific chat messages
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.CHAT_MESSAGES)) {
        localStorage.removeItem(key);
      }
    }
  }
}
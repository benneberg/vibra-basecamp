import { PromptTemplate, PromptTag } from "@/types";

const STORAGE_KEYS = {
  PROMPTS: 'ai-toolbox-prompts',
  PROMPT_TAGS: 'ai-toolbox-prompt-tags',
} as const;

// Default prompt tags
export const DEFAULT_PROMPT_TAGS: PromptTag[] = [
  { id: '1', name: 'Code Generation', color: 'hsl(var(--accent))' },
  { id: '2', name: 'Debugging', color: 'hsl(var(--destructive))' },
  { id: '3', name: 'Documentation', color: 'hsl(var(--primary))' },
  { id: '4', name: 'Testing', color: 'hsl(var(--secondary))' },
  { id: '5', name: 'Refactoring', color: 'hsl(var(--muted))' },
];

// Default prompt templates
export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: '1',
    title: 'Code Review Assistant',
    tags: ['Code Generation'],
    type: 'system',
    targetModel: 'gpt-4',
    description: 'Review code for best practices, bugs, and improvements',
    content: 'You are an expert code reviewer. Review the provided code for:\n- Best practices and conventions\n- Potential bugs or issues\n- Performance improvements\n- Security vulnerabilities\n- Code clarity and maintainability\n\nProvide specific, actionable feedback.',
    isFavorite: true,
    createdAt: new Date(),
    lastModified: new Date(),
  },
  {
    id: '2',
    title: 'Bug Debugging Helper',
    tags: ['Debugging'],
    type: 'system',
    targetModel: 'gpt-4',
    description: 'Help identify and fix bugs in code',
    content: 'You are a debugging expert. Help identify the root cause of bugs and provide step-by-step solutions. Focus on:\n- Error analysis\n- Code flow examination\n- Common pitfalls\n- Testing strategies\n- Prevention methods',
    isFavorite: false,
    createdAt: new Date(),
    lastModified: new Date(),
  },
];

export class PromptService {
  // Prompt Templates
  static getPrompts(): PromptTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (!stored) {
        this.savePrompts(DEFAULT_PROMPTS);
        return DEFAULT_PROMPTS;
      }
      
      const prompts = JSON.parse(stored);
      return prompts.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        lastModified: new Date(p.lastModified),
      }));
    } catch (error) {
      console.error('Error loading prompts:', error);
      return DEFAULT_PROMPTS;
    }
  }

  static savePrompts(prompts: PromptTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving prompts:', error);
    }
  }

  static createPrompt(promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'lastModified'>): PromptTemplate {
    const newPrompt: PromptTemplate = {
      ...promptData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastModified: new Date(),
    };

    const prompts = this.getPrompts();
    prompts.unshift(newPrompt);
    this.savePrompts(prompts);
    
    return newPrompt;
  }

  static updatePrompt(id: string, updates: Partial<PromptTemplate>): void {
    const prompts = this.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index !== -1) {
      prompts[index] = { 
        ...prompts[index], 
        ...updates, 
        lastModified: new Date() 
      };
      this.savePrompts(prompts);
    }
  }

  static deletePrompt(id: string): void {
    const prompts = this.getPrompts().filter(p => p.id !== id);
    this.savePrompts(prompts);
  }

  static toggleFavorite(id: string): void {
    const prompts = this.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index !== -1) {
      prompts[index].isFavorite = !prompts[index].isFavorite;
      prompts[index].lastModified = new Date();
      this.savePrompts(prompts);
    }
  }

  // Prompt Tags
  static getTags(): PromptTag[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_TAGS);
      if (!stored) {
        this.saveTags(DEFAULT_PROMPT_TAGS);
        return DEFAULT_PROMPT_TAGS;
      }
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading prompt tags:', error);
      return DEFAULT_PROMPT_TAGS;
    }
  }

  static saveTags(tags: PromptTag[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPT_TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving prompt tags:', error);
    }
  }

  static createTag(name: string, color: string): PromptTag {
    const newTag: PromptTag = {
      id: crypto.randomUUID(),
      name,
      color,
    };

    const tags = this.getTags();
    tags.push(newTag);
    this.saveTags(tags);
    
    return newTag;
  }

  static deleteTag(id: string): void {
    const tags = this.getTags().filter(t => t.id !== id);
    this.saveTags(tags);
  }
}
import { Project } from "@/types";

export interface ContextSource {
  id: string;
  type: 'github' | 'url' | 'file';
  source: string; // URL or file path
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

export class ContextService {
  private static readonly CHUNK_SIZE = 1000; // tokens
  private static readonly MAX_CHUNKS_PER_SOURCE = 50;
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // GitHub Repository Processing
  static async fetchGitHubRepo(repoUrl: string): Promise<ContextSource> {
    const repoId = this.extractRepoFromUrl(repoUrl);
    if (!repoId) throw new Error('Invalid GitHub URL');

    const contextSource: ContextSource = {
      id: crypto.randomUUID(),
      type: 'github',
      source: repoUrl,
      title: repoId,
      status: 'loading',
      chunks: [],
    };

    try {
      // Use GitHub API to fetch repository structure and key files
      const apiUrl = `https://api.github.com/repos/${repoId}`;
      const repoResponse = await fetch(apiUrl);
      
      if (!repoResponse.ok) {
        throw new Error('Repository not found or private');
      }

      const repoData = await repoResponse.json();
      
      // Fetch repository tree
      const treeUrl = `https://api.github.com/repos/${repoId}/git/trees/${repoData.default_branch}?recursive=1`;
      const treeResponse = await fetch(treeUrl);
      const treeData = await treeResponse.json();

      // Process important files (README, package.json, main source files)
      const importantFiles = treeData.tree.filter((file: any) => 
        this.isImportantFile(file.path) && file.type === 'blob'
      ).slice(0, 20); // Limit to prevent rate limiting

      const chunks: ContextChunk[] = [];
      
      for (const file of importantFiles) {
        try {
          const fileResponse = await fetch(`https://api.github.com/repos/${repoId}/contents/${file.path}`);
          const fileData = await fileResponse.json();
          
          if (fileData.content && fileData.size < 100000) { // Skip large files
            const content = atob(fileData.content);
            const fileChunks = this.chunkContent(content, file.path, 'code');
            chunks.push(...fileChunks);
          }
        } catch (error) {
          console.warn(`Failed to fetch file ${file.path}:`, error);
        }
      }

      contextSource.chunks = chunks.slice(0, this.MAX_CHUNKS_PER_SOURCE);
      contextSource.status = 'ready';
      contextSource.metadata = {
        lastFetched: new Date(),
      };

    } catch (error) {
      contextSource.status = 'error';
      throw error;
    }

    return contextSource;
  }

  // URL Content Processing
  static async fetchUrl(url: string): Promise<ContextSource> {
    const contextSource: ContextSource = {
      id: crypto.randomUUID(),
      type: 'url',
      source: url,
      title: new URL(url).hostname,
      status: 'loading',
      chunks: [],
    };

    try {
      // Use a CORS proxy for web scraping (in production, this should be server-side)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) {
        throw new Error('Failed to fetch URL content');
      }

      // Extract text content from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Remove script and style elements
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      const textContent = doc.body?.textContent || doc.textContent || '';
      const chunks = this.chunkContent(textContent, url, 'text');

      contextSource.chunks = chunks.slice(0, this.MAX_CHUNKS_PER_SOURCE);
      contextSource.status = 'ready';
      contextSource.metadata = {
        lastFetched: new Date(),
      };

    } catch (error) {
      contextSource.status = 'error';
      throw error;
    }

    return contextSource;
  }

  // File Processing
  static async processFile(file: File): Promise<ContextSource> {
    const contextSource: ContextSource = {
      id: crypto.randomUUID(),
      type: 'file',
      source: file.name,
      title: file.name,
      status: 'loading',
      chunks: [],
      metadata: {
        fileType: file.type,
        size: file.size,
      },
    };

    try {
      let content = '';

      if (file.type === 'application/pdf') {
        // For PDF processing, we'd need a PDF parser library
        // For now, we'll show a placeholder
        content = `PDF file: ${file.name} (${Math.round(file.size / 1024)}KB)\n[PDF content extraction requires additional setup]`;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX processing, we'd need a DOCX parser library
        content = `DOCX file: ${file.name} (${Math.round(file.size / 1024)}KB)\n[DOCX content extraction requires additional setup]`;
      } else {
        // Handle text files (md, txt)
        content = await file.text();
      }

      const chunks = this.chunkContent(content, file.name, this.detectContentType(file.type));

      contextSource.chunks = chunks.slice(0, this.MAX_CHUNKS_PER_SOURCE);
      contextSource.status = 'ready';
      contextSource.metadata = {
        ...contextSource.metadata,
        lastFetched: new Date(),
      };

    } catch (error) {
      contextSource.status = 'error';
      throw error;
    }

    return contextSource;
  }

  // Smart Content Chunking
  private static chunkContent(content: string, source: string, type: 'code' | 'documentation' | 'text'): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    
    if (type === 'code') {
      // Code-aware chunking (by functions, classes, etc.)
      const codeChunks = this.chunkCode(content, source);
      chunks.push(...codeChunks);
    } else if (type === 'documentation' && content.includes('#')) {
      // Markdown-aware chunking (by sections)
      const mdChunks = this.chunkMarkdown(content, source);
      chunks.push(...mdChunks);
    } else {
      // Paragraph-aware chunking
      const textChunks = this.chunkText(content, source, type);
      chunks.push(...textChunks);
    }

    return chunks;
  }

  private static chunkCode(content: string, source: string): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    const lines = content.split('\n');
    const language = this.detectLanguage(source);
    
    let currentChunk = '';
    let currentLine = 1;
    let chunkStartLine = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentChunk += line + '\n';
      
      // Split on function/class boundaries or when chunk gets too large
      if (this.isCodeBoundary(line, language) || this.estimateTokens(currentChunk) > this.CHUNK_SIZE) {
        if (currentChunk.trim()) {
          chunks.push({
            id: crypto.randomUUID(),
            content: currentChunk.trim(),
            metadata: {
              source,
              type: 'code',
              language,
              filePath: source,
              startLine: chunkStartLine,
              endLine: currentLine,
            },
            tokens: this.estimateTokens(currentChunk),
          });
        }
        
        currentChunk = '';
        chunkStartLine = currentLine + 1;
      }
      
      currentLine++;
    }
    
    // Add remaining content
    if (currentChunk.trim()) {
      chunks.push({
        id: crypto.randomUUID(),
        content: currentChunk.trim(),
        metadata: {
          source,
          type: 'code',
          language,
          filePath: source,
          startLine: chunkStartLine,
          endLine: currentLine,
        },
        tokens: this.estimateTokens(currentChunk),
      });
    }
    
    return chunks;
  }

  private static chunkMarkdown(content: string, source: string): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    const sections = content.split(/^#+\s/m);
    
    sections.forEach((section, index) => {
      if (section.trim()) {
        const sectionContent = index === 0 ? section : `# ${section}`;
        if (this.estimateTokens(sectionContent) > this.CHUNK_SIZE) {
          // Further split large sections
          const subChunks = this.chunkText(sectionContent, source, 'documentation');
          chunks.push(...subChunks);
        } else {
          chunks.push({
            id: crypto.randomUUID(),
            content: sectionContent.trim(),
            metadata: {
              source,
              type: 'documentation',
            },
            tokens: this.estimateTokens(sectionContent),
          });
        }
      }
    });
    
    return chunks;
  }

  private static chunkText(content: string, source: string, type: 'code' | 'documentation' | 'text'): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    const paragraphs = content.split(/\n\s*\n/);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (this.estimateTokens(currentChunk + paragraph) > this.CHUNK_SIZE) {
        if (currentChunk.trim()) {
          chunks.push({
            id: crypto.randomUUID(),
            content: currentChunk.trim(),
            metadata: { source, type },
            tokens: this.estimateTokens(currentChunk),
          });
        }
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({
        id: crypto.randomUUID(),
        content: currentChunk.trim(),
        metadata: { source, type },
        tokens: this.estimateTokens(currentChunk),
      });
    }
    
    return chunks;
  }

  // Context Retrieval for Chat
  static getRelevantContext(query: string, contextSources: ContextSource[], maxTokens: number = 4000): ContextChunk[] {
    const allChunks = contextSources.flatMap(source => 
      source.status === 'ready' ? source.chunks : []
    );
    
    // Simple keyword matching (in production, use vector similarity)
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredChunks = allChunks.map(chunk => ({
      chunk,
      score: this.calculateRelevanceScore(chunk, queryWords),
    }));
    
    // Sort by relevance and select chunks within token limit
    scoredChunks.sort((a, b) => b.score - a.score);
    
    const selectedChunks: ContextChunk[] = [];
    let totalTokens = 0;
    
    for (const { chunk } of scoredChunks) {
      if (totalTokens + chunk.tokens > maxTokens) break;
      selectedChunks.push(chunk);
      totalTokens += chunk.tokens;
    }
    
    return selectedChunks;
  }

  // Utility Methods
  private static extractRepoFromUrl(url: string): string | null {
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  }

  private static isImportantFile(path: string): boolean {
    const importantPatterns = [
      /README/i,
      /package\.json$/,
      /\.md$/,
      /\.js$/,
      /\.ts$/,
      /\.jsx$/,
      /\.tsx$/,
      /\.py$/,
      /\.java$/,
      /\.cpp$/,
      /\.c$/,
      /\.go$/,
      /\.rs$/,
    ];
    
    return importantPatterns.some(pattern => pattern.test(path));
  }

  private static detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'sh': 'bash',
    };
    
    return languageMap[ext || ''] || 'text';
  }

  private static detectContentType(mimeType: string): 'code' | 'documentation' | 'text' {
    if (mimeType.includes('text/markdown')) return 'documentation';
    if (mimeType.includes('text/')) return 'text';
    return 'text';
  }

  private static isCodeBoundary(line: string, language: string): boolean {
    const boundaries = {
      javascript: [/^(function|class|const|let|var)\s/, /^export\s/, /^import\s/],
      typescript: [/^(function|class|interface|type|const|let|var)\s/, /^export\s/, /^import\s/],
      python: [/^(def|class)\s/, /^import\s/, /^from\s/],
      java: [/^(public|private|protected)?\s*(class|interface|enum)\s/, /^import\s/],
    };
    
    const patterns = boundaries[language as keyof typeof boundaries] || [];
    return patterns.some(pattern => pattern.test(line.trim()));
  }

  private static calculateRelevanceScore(chunk: ContextChunk, queryWords: string[]): number {
    const content = chunk.content.toLowerCase();
    let score = 0;
    
    queryWords.forEach(word => {
      const wordCount = (content.match(new RegExp(word, 'g')) || []).length;
      score += wordCount;
    });
    
    // Boost score for code chunks if query seems code-related
    if (chunk.metadata.type === 'code' && queryWords.some(word => 
      ['function', 'class', 'method', 'variable', 'import', 'export'].includes(word)
    )) {
      score *= 1.5;
    }
    
    return score;
  }

  private static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}
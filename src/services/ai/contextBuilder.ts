
import { ProcessedDocument } from '@/types/documentTypes';

export class ContextBuilder {
  private contextWindow = 150; // words to include in context

  buildEnhancedContext(analysis: any, recentTranscript: string, userDocuments: ProcessedDocument[]): string {
    // Get last N words for context
    const words = recentTranscript.split(' ');
    const contextWords = words.slice(-this.contextWindow).join(' ');
    
    // Add question-specific context
    let enhancedContext = `Recent conversation: "${contextWords}"\n`;
    enhancedContext += `Current question: "${analysis.transcript}"\n`;
    enhancedContext += `Question type: ${analysis.questionType}\n`;
    
    // Add relevant document context
    if (userDocuments.length > 0) {
      const relevantDocs = this.findRelevantDocuments(analysis, userDocuments);
      if (relevantDocs.length > 0) {
        enhancedContext += `\nRelevant background from user documents:\n`;
        relevantDocs.forEach(doc => {
          const docDescription = this.getDocumentDescription(doc);
          enhancedContext += `- ${docDescription}\n`;
        });
      }
    }
    
    return enhancedContext;
  }

  private findRelevantDocuments(analysis: any, userDocuments: ProcessedDocument[]): ProcessedDocument[] {
    const keywords = this.extractKeywords(analysis.transcript);
    
    return userDocuments.filter(doc => {
      const docText = this.getSearchableText(doc).toLowerCase();
      return keywords.some(keyword => docText.includes(keyword.toLowerCase()));
    }).slice(0, 2); // Limit to most relevant documents
  }

  private getDocumentDescription(doc: ProcessedDocument): string {
    if (doc.analysis?.personalInfo?.name) {
      return `Profile for ${doc.analysis.personalInfo.name}`;
    }
    return doc.name || 'Document';
  }

  private getSearchableText(doc: ProcessedDocument): string {
    const parts = [];
    
    if (doc.analysis?.personalInfo?.name) {
      parts.push(doc.analysis.personalInfo.name);
    }
    
    if (doc.analysis?.skills?.technical) {
      parts.push(...doc.analysis.skills.technical);
    }
    
    if (doc.analysis?.skills?.soft) {
      parts.push(...doc.analysis.skills.soft);
    }
    
    if (doc.name) {
      parts.push(doc.name);
    }
    
    return parts.join(' ');
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'tell', 'me', 'about', 'what', 'how', 'why', 'when', 'where', 'you', 'your', 'can', 'could', 'would', 'should'];
    
    return words.filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      /^[a-zA-Z]+$/.test(word)
    );
  }
}

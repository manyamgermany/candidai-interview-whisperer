
import { DocumentAnalysis, ProcessedDocument } from '@/types/documentTypes';
import { textExtractionService } from './textExtractionService';
import { contentParsingService } from './contentParsingService';
import { insightsGenerationService } from './insightsGenerationService';
import { documentStorageService } from './documentStorageService';

class DocumentProcessingService {
  async processDocument(file: File, onProgress?: (step: string, progress: number) => void): Promise<ProcessedDocument> {
    const document: ProcessedDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'processing',
      uploadedAt: Date.now(),
      processingStep: 'Starting analysis...'
    };

    try {
      console.log('Starting document processing for:', file.name);
      
      onProgress?.('Extracting text content...', 25);
      document.processingStep = 'Extracting text content...';
      await documentStorageService.saveDocument(document);
      
      const rawText = await textExtractionService.extractTextFromFile(file);
      document.rawText = rawText;
      
      console.log('Text extracted successfully, length:', rawText.length);

      onProgress?.('Analyzing resume content...', 50);
      document.processingStep = 'Analyzing resume content...';
      await documentStorageService.saveDocument(document);

      const parsedContent = contentParsingService.parseResumeContent(rawText);
      
      console.log('Content parsed successfully');

      onProgress?.('Generating AI insights...', 75);
      document.processingStep = 'Generating AI insights...';
      await documentStorageService.saveDocument(document);

      const analysis: DocumentAnalysis = {
        personalInfo: parsedContent.personalInfo || {
          name: 'Not found',
          email: '',
          phone: ''
        },
        skills: parsedContent.skills || { technical: [], soft: [] },
        experience: parsedContent.experience || [],
        education: parsedContent.education || [],
        certifications: parsedContent.certifications || [],
        insights: insightsGenerationService.generateInsights(parsedContent)
      };

      onProgress?.('Finalizing analysis...', 90);
      document.processingStep = 'Finalizing analysis...';

      document.analysis = analysis;
      document.status = 'completed';
      delete document.processingStep;

      console.log('Document processed successfully with real data');

      await documentStorageService.saveDocument(document);
      onProgress?.('Analysis complete!', 100);

      return document;
    } catch (error) {
      console.error('Document processing failed:', error);
      document.status = 'error';
      document.processingStep = 'Processing failed';
      await documentStorageService.saveDocument(document);
      return document;
    }
  }

  async saveDocument(document: ProcessedDocument): Promise<void> {
    return documentStorageService.saveDocument(document);
  }

  async getDocuments(): Promise<ProcessedDocument[]> {
    return documentStorageService.getDocuments();
  }

  async deleteDocument(id: string): Promise<void> {
    return documentStorageService.deleteDocument(id);
  }
}

export const documentProcessingService = new DocumentProcessingService();

// Re-export types for backward compatibility
export type { DocumentAnalysis, ProcessedDocument };

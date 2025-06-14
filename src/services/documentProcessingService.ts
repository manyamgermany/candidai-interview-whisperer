
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
      console.log('Starting document processing for:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Save initial document state
      onProgress?.('Initializing document...', 10);
      document.processingStep = 'Initializing document...';
      await documentStorageService.saveDocument(document);
      
      // Extract text content
      onProgress?.('Extracting text content...', 25);
      document.processingStep = 'Extracting text content...';
      await documentStorageService.saveDocument(document);
      
      const rawText = await textExtractionService.extractTextFromFile(file);
      document.rawText = rawText;
      
      console.log('Text extracted successfully, length:', rawText.length);
      console.log('Text preview:', rawText.substring(0, 200));

      // Parse content
      onProgress?.('Analyzing resume content...', 50);
      document.processingStep = 'Analyzing resume content...';
      await documentStorageService.saveDocument(document);

      const parsedContent = contentParsingService.parseResumeContent(rawText);
      
      console.log('Content parsed successfully:', {
        hasPersonalInfo: !!parsedContent.personalInfo,
        technicalSkills: parsedContent.skills?.technical?.length || 0,
        softSkills: parsedContent.skills?.soft?.length || 0,
        experience: parsedContent.experience?.length || 0,
        education: parsedContent.education?.length || 0
      });

      // Generate insights
      onProgress?.('Generating AI insights...', 75);
      document.processingStep = 'Generating AI insights...';
      await documentStorageService.saveDocument(document);

      const insights = insightsGenerationService.generateInsights(parsedContent);

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
        insights
      };

      // Finalize
      onProgress?.('Finalizing analysis...', 90);
      document.processingStep = 'Finalizing analysis...';

      document.analysis = analysis;
      document.status = 'completed';
      delete document.processingStep;

      console.log('Document processed successfully with analysis:', {
        personalInfo: analysis.personalInfo.name,
        technicalSkills: analysis.skills.technical.length,
        softSkills: analysis.skills.soft.length,
        overallScore: analysis.insights.overallScore
      });

      await documentStorageService.saveDocument(document);
      onProgress?.('Analysis complete!', 100);

      return document;
    } catch (error) {
      console.error('Document processing failed:', error);
      document.status = 'error';
      document.processingStep = `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
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


import { ProcessedDocument } from '@/types/documentTypes';
import { chromeStorage } from '@/utils/chromeStorage';

export class DocumentStorageService {
  async saveDocument(document: ProcessedDocument): Promise<void> {
    try {
      const documents = await this.getDocuments();
      const existingIndex = documents.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        documents[existingIndex] = document;
      } else {
        documents.push(document);
      }
      
      await chromeStorage.setItem('processedDocuments', documents);
      console.log('Document saved to storage');
    } catch (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<ProcessedDocument[]> {
    try {
      const documents = await chromeStorage.getItem('processedDocuments') as ProcessedDocument[] | null;
      const result = documents || [];
      console.log('Retrieved documents from storage:', result.length);
      return result;
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = await this.getDocuments();
      const filtered = documents.filter(doc => doc.id !== id);
      await chromeStorage.setItem('processedDocuments', filtered);
      console.log('Document deleted:', id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }
}

export const documentStorageService = new DocumentStorageService();

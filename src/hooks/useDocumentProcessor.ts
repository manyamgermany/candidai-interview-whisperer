
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  documentProcessingService, 
  ProcessedDocument, 
  DocumentAnalysis 
} from "@/services/documentProcessingService";

export type ViewMode = 'main' | 'manual-form';

export const useDocumentProcessor = () => {
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [processingComplete, setProcessingComplete] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [manualProfile, setManualProfile] = useState<DocumentAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingDocuments();
  }, []);

  const loadExistingDocuments = async () => {
    try {
      setIsLoading(true);
      const documents = await documentProcessingService.getDocuments();
      setUploadedFiles(documents);
      console.log('Loaded documents:', documents.length);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error Loading Documents",
        description: "Failed to load existing documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiles = async (files: FileList) => {
    console.log('Starting file processing for', files.length, 'files');
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep('Preparing to process documents...');
    setProcessingComplete(false);
    
    for (const file of Array.from(files)) {
      const supportedTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/markdown'
      ];
      
      const supportedExtensions = ['.pdf', '.txt', '.docx', '.md'];
      
      const isValidType = supportedTypes.includes(file.type) || 
                         supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        toast({
          title: "Unsupported File Type",
          description: "Please upload PDF, TXT, DOCX, or MD files only.",
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        continue;
      }

      try {
        console.log('Processing file:', file.name);
        
        toast({
          title: "Processing Started",
          description: `Starting analysis of ${file.name}...`,
        });

        const processedDoc = await documentProcessingService.processDocument(
          file,
          (step: string, progress: number) => {
            console.log('Progress update:', step, progress + '%');
            setProcessingStep(step);
            setProcessingProgress(progress);
          }
        );
        
        console.log('File processed:', processedDoc.status, processedDoc.analysis ? 'with analysis' : 'without analysis');
        
        setUploadedFiles(prev => {
          const filtered = prev.filter(doc => doc.id !== processedDoc.id);
          return [processedDoc, ...filtered];
        });

        if (processedDoc.status === 'completed' && processedDoc.analysis) {
          setProcessingComplete(true);
          toast({
            title: "Document Processed Successfully",
            description: `${file.name} has been analyzed and is ready for use.`,
          });
        } else {
          toast({
            title: "Processing Failed",
            description: `Failed to process ${file.name}.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('File processing error:', error);
        toast({
          title: "Processing Error",
          description: `Error processing ${file.name}.`,
          variant: "destructive",
        });
      }
    }
    
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingStep('');
  };

  const handleManualProfileSave = (analysis: DocumentAnalysis) => {
    const manualDoc: ProcessedDocument = {
      id: 'manual-profile-' + Date.now(),
      name: 'Manual Profile',
      type: 'manual',
      size: 0,
      status: 'completed',
      uploadedAt: Date.now(),
      analysis
    };

    setManualProfile(analysis);
    setUploadedFiles(prev => [manualDoc, ...prev]);
    setViewMode('main');
    
    toast({
      title: "Manual Profile Created",
      description: "Your profile has been created and is ready for interview assistance.",
    });
  };

  return {
    uploadedFiles,
    setUploadedFiles,
    selectedFiles,
    setSelectedFiles,
    dragActive,
    setDragActive,
    isLoading,
    isProcessing,
    processingProgress,
    processingStep,
    processingComplete,
    viewMode,
    setViewMode,
    manualProfile,
    fileInputRef,
    toast,
    loadExistingDocuments,
    handleFiles,
    handleManualProfileSave
  };
};


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
      console.log('Loading existing documents...');
      const documents = await documentProcessingService.getDocuments();
      setUploadedFiles(documents);
      console.log('Loaded documents:', documents.length, documents);
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

  const validateFile = (file: File): string | null => {
    console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
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
      console.log('Invalid file type:', file.type, 'Name:', file.name);
      return "Please upload PDF, TXT, DOCX, or MD files only.";
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return "Please upload files smaller than 10MB.";
    }

    if (file.size === 0) {
      console.log('File is empty:', file.name);
      return "Please upload a non-empty file.";
    }

    console.log('File validation passed');
    return null;
  };

  const handleFiles = async (files: FileList) => {
    console.log('=== STARTING FILE PROCESSING ===');
    console.log('Files received:', files.length);
    
    if (files.length === 0) {
      console.log('No files provided');
      return;
    }

    // Log each file
    Array.from(files).forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
    });

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep('Preparing to process documents...');
    setProcessingComplete(false);
    
    try {
      for (const file of Array.from(files)) {
        console.log('=== PROCESSING FILE ===', file.name);
        
        const validationError = validateFile(file);
        if (validationError) {
          console.log('Validation failed:', validationError);
          toast({
            title: "Invalid File",
            description: validationError,
            variant: "destructive",
          });
          continue;
        }

        console.log('File validation passed, starting processing...');
        
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
        
        console.log('File processing completed:', {
          id: processedDoc.id,
          name: processedDoc.name,
          status: processedDoc.status,
          hasAnalysis: !!processedDoc.analysis,
          rawTextLength: processedDoc.rawText?.length || 0
        });
        
        setUploadedFiles(prev => {
          const filtered = prev.filter(doc => doc.id !== processedDoc.id);
          const newList = [processedDoc, ...filtered];
          console.log('Updated file list, total files:', newList.length);
          return newList;
        });

        if (processedDoc.status === 'completed' && processedDoc.analysis) {
          setProcessingComplete(true);
          console.log('Processing completed successfully with analysis');
          toast({
            title: "Document Processed Successfully",
            description: `${file.name} has been analyzed and is ready for use.`,
          });
        } else if (processedDoc.status === 'error') {
          console.log('Processing failed with error status');
          toast({
            title: "Processing Failed",
            description: `Failed to process ${file.name}. ${processedDoc.processingStep || 'Please check the file format and try again.'}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: `Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      console.log('=== FILE PROCESSING COMPLETE ===');
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStep('');
    }
  };

  const handleManualProfileSave = async (analysis: DocumentAnalysis) => {
    try {
      console.log('Saving manual profile...');
      const manualDoc: ProcessedDocument = {
        id: 'manual-profile-' + Date.now(),
        name: 'Manual Profile',
        type: 'manual',
        size: 0,
        status: 'completed',
        uploadedAt: Date.now(),
        analysis
      };

      await documentProcessingService.saveDocument(manualDoc);
      setManualProfile(analysis);
      setUploadedFiles(prev => [manualDoc, ...prev]);
      setViewMode('main');
      
      console.log('Manual profile saved successfully');
      toast({
        title: "Manual Profile Created",
        description: "Your profile has been created and is ready for interview assistance.",
      });
    } catch (error) {
      console.error('Failed to save manual profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save manual profile.",
        variant: "destructive",
      });
    }
  };

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Drag enter detected');
      setDragActive(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Drag leave detected');
      setDragActive(false);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      console.log('Files dropped - checking dataTransfer...');
      console.log('DataTransfer files:', e.dataTransfer.files.length);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        console.log('Processing dropped files...');
        handleFiles(e.dataTransfer.files);
      } else {
        console.log('No files found in drop event');
      }
    }
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
    handleManualProfileSave,
    handleDragEvents
  };
};

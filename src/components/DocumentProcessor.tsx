import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  RefreshCw,
  FileCheck,
  UserPlus,
  Upload
} from "lucide-react";
import { documentProcessingService, ProcessedDocument, DocumentAnalysis } from "@/services/documentProcessingService";
import DocumentUploadZone from "./document/DocumentUploadZone";
import DocumentLibrary from "./document/DocumentLibrary";
import AnalysisResults from "./document/AnalysisResults";
import ManualProfileForm from "./document/ManualProfileForm";

interface DocumentProcessorProps {
  onNavigate: (tab: string) => void;
}

type ViewMode = 'main' | 'manual-form';

const DocumentProcessor = ({ onNavigate }: DocumentProcessorProps) => {
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

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(uploadedFiles.map(f => f.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    try {
      for (const fileId of selectedFiles) {
        await documentProcessingService.deleteDocument(fileId);
      }
      
      setUploadedFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
      
      toast({
        title: "Documents Deleted",
        description: `${selectedFiles.size} document(s) have been removed.`,
      });
    } catch (error) {
      console.error('Failed to delete documents:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected documents.",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = () => {
    if (selectedFiles.size === 0) return;

    const selectedDocs = uploadedFiles.filter(f => selectedFiles.has(f.id) && f.analysis);
    const exportData = selectedDocs.map(doc => ({
      name: doc.name,
      analysis: doc.analysis
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `bulk_analysis_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${selectedDocs.length} analysis file(s) exported.`,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
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
        
        // Update the files list with the processed document
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

  const removeFile = async (id: string) => {
    try {
      await documentProcessingService.deleteDocument(id);
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast({
        title: "Document Deleted",
        description: "Document has been removed.",
      });
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const exportAnalysis = (processedDocument: ProcessedDocument) => {
    if (!processedDocument.analysis) return;
    
    const dataStr = JSON.stringify(processedDocument.analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${processedDocument.name}_analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
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

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
  const latestAnalysis = manualProfile || completedFiles[0]?.analysis;

  console.log('Current state:', {
    uploadedFiles: uploadedFiles.length,
    completedFiles: completedFiles.length,
    hasLatestAnalysis: !!latestAnalysis,
    isProcessing,
    processingComplete
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-pink-600" />
          <span className="text-lg text-gray-600">Loading documents...</span>
        </div>
      </div>
    );
  }

  if (viewMode === 'manual-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setViewMode('main')}
                  className="text-gray-600 hover:text-pink-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Documents
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Manual Profile Creation</h1>
                    <p className="text-xs text-gray-500">Create your profile manually</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ManualProfileForm
            onSave={handleManualProfileSave}
            onCancel={() => setViewMode('main')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("dashboard");
                }}
                className="text-gray-600 hover:text-pink-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Profile Builder</h1>
                  <p className="text-xs text-gray-500">Resume Analysis & Manual Profile Creation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {uploadedFiles.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <FileCheck className="h-4 w-4" />
                  <span>{uploadedFiles.length} profile{uploadedFiles.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{processingStep || 'Processing...'}</span>
                  {processingProgress > 0 && (
                    <span className="text-xs">({processingProgress}%)</span>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadExistingDocuments}
                className="text-gray-600 hover:text-pink-600"
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload & Creation Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <DocumentUploadZone
                dragActive={dragActive}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onFilesSelected={handleFiles}
                isProcessing={isProcessing}
                processingStep={processingStep}
                processingProgress={processingProgress}
                processingComplete={processingComplete}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-pink-50 via-white to-rose-50 text-gray-500">or</span>
                </div>
              </div>

              <Button
                onClick={() => setViewMode('manual-form')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-16"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Create Manual Profile</div>
                  <div className="text-xs opacity-90">Add your details manually</div>
                </div>
              </Button>
            </div>

            <DocumentLibrary
              documents={uploadedFiles}
              selectedFiles={selectedFiles}
              onSelectFile={handleSelectFile}
              onSelectAll={handleSelectAll}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
              onDeleteDocument={removeFile}
              onExportDocument={exportAnalysis}
            />
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            <AnalysisResults
              analysis={latestAnalysis}
              onUploadClick={() => fileInputRef.current?.click()}
              onManualCreate={() => setViewMode('manual-form')}
              isProcessing={isProcessing}
              processingStep={processingStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor;

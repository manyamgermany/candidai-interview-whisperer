import { RefreshCw } from "lucide-react";
import { documentProcessingService, ProcessedDocument } from "@/services/documentProcessingService";
import AnalysisResults from "./document/AnalysisResults";
import ManualProfileForm from "./document/ManualProfileForm";
import DocumentProcessorHeader from "./document/DocumentProcessorHeader";
import DocumentProcessorUploadSection from "./document/DocumentProcessorUploadSection";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";

interface DocumentProcessorProps {
  onNavigate: (tab: string) => void;
  onDocumentProcessed?: () => void;
  compact?: boolean;
}

const DocumentProcessor = ({ onNavigate, onDocumentProcessed, compact = false }: DocumentProcessorProps) => {
  const {
    uploadedFiles,
    setUploadedFiles,
    selectedFiles,
    setSelectedFiles,
    dragActive,
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
  } = useDocumentProcessor();

  // Notify parent when document processing is complete
  React.useEffect(() => {
    if (processingComplete && onDocumentProcessed) {
      onDocumentProcessed();
    }
  }, [processingComplete, onDocumentProcessed]);

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

  const handleFileInputClick = () => {
    if (isProcessing) {
      console.log('File input click blocked - processing in progress');
      return;
    }
    console.log('Triggering file input click from DocumentProcessor');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalysisUpdate = async (updatedAnalysis: any) => {
    try {
      const latestDoc = uploadedFiles.find(f => f.status === 'completed' && f.analysis);
      if (latestDoc) {
        const updatedDoc = { ...latestDoc, analysis: updatedAnalysis };
        await documentProcessingService.saveDocument(updatedDoc);
        setUploadedFiles(prev => prev.map(doc => 
          doc.id === latestDoc.id ? updatedDoc : doc
        ));
        toast({
          title: "Analysis Updated",
          description: "Your profile changes have been saved.",
        });
      }
    } catch (error) {
      console.error('Failed to update analysis:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save your changes.",
        variant: "destructive",
      });
    }
  };

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
  const latestAnalysis = manualProfile || completedFiles[0]?.analysis;

  console.log('DocumentProcessor render state:', {
    uploadedFiles: uploadedFiles.length,
    completedFiles: completedFiles.length,
    hasLatestAnalysis: !!latestAnalysis,
    isProcessing,
    processingComplete,
    dragActive,
    viewMode
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
      <div className={compact ? "" : "min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50"}>
        {!compact && (
          <DocumentProcessorHeader
            onNavigate={onNavigate}
            uploadedFiles={uploadedFiles}
            isProcessing={isProcessing}
            processingStep={processingStep}
            processingProgress={processingProgress}
            onRefresh={loadExistingDocuments}
            viewMode={viewMode}
            onBackToDocuments={() => setViewMode('main')}
          />
        )}

        <div className={compact ? "" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          <ManualProfileForm
            onSave={handleManualProfileSave}
            onCancel={() => setViewMode('main')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50"}>
      {!compact && (
        <DocumentProcessorHeader
          onNavigate={onNavigate}
          uploadedFiles={uploadedFiles}
          isProcessing={isProcessing}
          processingStep={processingStep}
          processingProgress={processingProgress}
          onRefresh={loadExistingDocuments}
          viewMode={viewMode}
        />
      )}

      <div className={compact ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <div className={compact ? "space-y-6" : "grid lg:grid-cols-3 gap-8"}>
          <DocumentProcessorUploadSection
            dragActive={dragActive}
            onDragEnter={handleDragEvents.onDragEnter}
            onDragLeave={handleDragEvents.onDragLeave}
            onDragOver={handleDragEvents.onDragOver}
            onDrop={handleDragEvents.onDrop}
            onFilesSelected={handleFiles}
            isProcessing={isProcessing}
            processingStep={processingStep}
            processingProgress={processingProgress}
            processingComplete={processingComplete}
            onManualCreate={() => setViewMode('manual-form')}
            uploadedFiles={uploadedFiles}
            selectedFiles={selectedFiles}
            onSelectFile={handleSelectFile}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onDeleteDocument={removeFile}
            onExportDocument={exportAnalysis}
          />

          <div className={compact ? "" : "lg:col-span-2"}>
            <AnalysisResults
              analysis={latestAnalysis}
              onUploadClick={handleFileInputClick}
              onManualCreate={() => setViewMode('manual-form')}
              onAnalysisUpdate={handleAnalysisUpdate}
              isProcessing={isProcessing}
              processingStep={processingStep}
            />
          </div>
        </div>

        {/* Hidden file input for manual triggering */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.md"
          multiple
          onChange={(e) => {
            console.log('Hidden file input changed:', e.target.files?.length);
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = ''; // Reset for repeated uploads
            }
          }}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default DocumentProcessor;


import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import DocumentUploadZone from "./DocumentUploadZone";
import DocumentLibrary from "./DocumentLibrary";
import { ProcessedDocument } from "@/services/documentProcessingService";

interface DocumentProcessorUploadSectionProps {
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
  processingStep: string;
  processingProgress: number;
  processingComplete: boolean;
  onManualCreate: () => void;
  uploadedFiles: ProcessedDocument[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onDeleteDocument: (id: string) => void;
  onExportDocument: (document: ProcessedDocument) => void;
}

const DocumentProcessorUploadSection = ({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFilesSelected,
  isProcessing,
  processingStep,
  processingProgress,
  processingComplete,
  onManualCreate,
  uploadedFiles,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onBulkDelete,
  onBulkExport,
  onDeleteDocument,
  onExportDocument
}: DocumentProcessorUploadSectionProps) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <DocumentUploadZone
          dragActive={dragActive}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onFilesSelected={onFilesSelected}
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
          onClick={onManualCreate}
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
        onSelectFile={onSelectFile}
        onSelectAll={onSelectAll}
        onBulkDelete={onBulkDelete}
        onBulkExport={onBulkExport}
        onDeleteDocument={onDeleteDocument}
        onExportDocument={onExportDocument}
      />
    </div>
  );
};

export default DocumentProcessorUploadSection;


import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, RefreshCw, FileCheck, UserPlus } from "lucide-react";
import { ProcessedDocument } from "@/services/documentProcessingService";

interface DocumentProcessorHeaderProps {
  onNavigate: (tab: string) => void;
  uploadedFiles: ProcessedDocument[];
  isProcessing: boolean;
  processingStep: string;
  processingProgress: number;
  onRefresh: () => void;
  viewMode: 'main' | 'manual-form';
  onBackToDocuments?: () => void;
}

const DocumentProcessorHeader = ({
  onNavigate,
  uploadedFiles,
  isProcessing,
  processingStep,
  processingProgress,
  onRefresh,
  viewMode,
  onBackToDocuments
}: DocumentProcessorHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'manual-form' && onBackToDocuments) {
                  onBackToDocuments();
                } else {
                  onNavigate("dashboard");
                }
              }}
              className="text-gray-600 hover:text-pink-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {viewMode === 'manual-form' ? 'Back to Documents' : 'Back to Dashboard'}
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                {viewMode === 'manual-form' ? (
                  <UserPlus className="h-5 w-5 text-white" />
                ) : (
                  <FileText className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {viewMode === 'manual-form' ? 'Manual Profile Creation' : 'Profile Builder'}
                </h1>
                <p className="text-xs text-gray-500">
                  {viewMode === 'manual-form' 
                    ? 'Create your profile manually' 
                    : 'Resume Analysis & Manual Profile Creation'
                  }
                </p>
              </div>
            </div>
          </div>
          {viewMode === 'main' && (
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
                onClick={onRefresh}
                className="text-gray-600 hover:text-pink-600"
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DocumentProcessorHeader;

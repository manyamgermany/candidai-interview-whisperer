
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadZoneProps {
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList) => void;
  isProcessing?: boolean;
  processingStep?: string;
  processingProgress?: number;
  processingComplete?: boolean;
}

const DocumentUploadZone = ({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFilesSelected,
  isProcessing = false,
  processingStep = '',
  processingProgress = 0,
  processingComplete = false
}: DocumentUploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      onFilesSelected(e.target.files);
    }
  };

  const getStatusIcon = () => {
    if (processingComplete) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (isProcessing) {
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    } else {
      return <Upload className="h-5 w-5 text-pink-600" />;
    }
  };

  const getStatusText = () => {
    if (processingComplete) {
      return 'Document Analysis Complete';
    } else if (isProcessing) {
      return 'Processing Documents';
    } else {
      return 'Upload Documents';
    }
  };

  const getDescriptionText = () => {
    if (processingComplete) {
      return 'Your document has been successfully analyzed. You can upload another document or view results below.';
    } else if (isProcessing) {
      return processingStep || 'Please wait while we analyze your documents...';
    } else {
      return 'Upload your resume for AI-powered analysis and insights';
    }
  };

  return (
    <Card className={`border-2 ${
      processingComplete ? 'border-green-200 bg-green-50' : 
      isProcessing ? 'border-blue-200 bg-blue-50' : 
      'border-pink-100'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </CardTitle>
        <CardDescription>
          {getDescriptionText()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            processingComplete
              ? 'border-green-300 bg-green-25'
              : isProcessing
                ? 'border-blue-200 bg-blue-25 opacity-75 cursor-not-allowed'
                : dragActive 
                  ? 'border-pink-400 bg-pink-50' 
                  : 'border-pink-200 hover:border-pink-300 hover:bg-pink-25 cursor-pointer'
          }`}
          onDragEnter={isProcessing ? undefined : onDragEnter}
          onDragLeave={isProcessing ? undefined : onDragLeave}
          onDragOver={isProcessing ? undefined : onDragOver}
          onDrop={isProcessing ? undefined : onDrop}
          onClick={!isProcessing ? handleFileSelect : undefined}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-blue-400 mx-auto animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {processingStep || 'Processing your documents...'}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  This may take a few moments
                </p>
                <Progress 
                  value={processingProgress} 
                  className="w-full max-w-xs mx-auto h-2" 
                />
                <div className="text-xs text-gray-500 mt-2">
                  {processingProgress}% complete
                </div>
              </div>
            </div>
          ) : processingComplete ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Analysis Complete!
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Your resume has been successfully processed
                </p>
                <Button
                  onClick={handleFileSelect}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Another Document
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                Drop your resume here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports PDF, TXT, DOCX, MD files up to 10MB
              </p>
              <Button
                onClick={handleFileSelect}
                disabled={isProcessing}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                Choose File
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.md"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadZone;

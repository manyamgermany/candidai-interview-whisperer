
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2 } from "lucide-react";
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
  processingProgress = 0
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

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-pink-600" />
          )}
          <span>
            {isProcessing ? 'Processing Documents' : 'Upload Documents'}
          </span>
        </CardTitle>
        <CardDescription>
          {isProcessing 
            ? processingStep || 'Please wait while we analyze your documents...'
            : 'Upload your resume for AI-powered analysis and insights'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isProcessing
              ? 'border-blue-200 bg-blue-25 opacity-75 cursor-not-allowed'
              : dragActive 
                ? 'border-pink-400 bg-pink-50' 
                : 'border-pink-200 hover:border-pink-300 hover:bg-pink-25'
          }`}
          onDragEnter={isProcessing ? undefined : onDragEnter}
          onDragLeave={isProcessing ? undefined : onDragLeave}
          onDragOver={isProcessing ? undefined : onDragOver}
          onDrop={isProcessing ? undefined : onDrop}
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
                <Progress value={processingProgress} className="w-full max-w-xs mx-auto" />
                <div className="text-xs text-gray-500 mt-2">
                  {processingProgress}% complete
                </div>
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

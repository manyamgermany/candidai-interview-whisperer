
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Trash2,
  Loader2
} from "lucide-react";
import { ProcessedDocument } from "@/services/documentProcessingService";

interface DocumentCardProps {
  document: ProcessedDocument;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: () => void;
  onExport?: () => void;
}

const DocumentCard = ({ 
  document, 
  isSelected, 
  onSelect, 
  onDelete, 
  onExport 
}: DocumentCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'completed':
        return 'Analysis Complete';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Processing Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isSelected 
        ? 'border-pink-300 bg-pink-50' 
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            disabled={document.status === 'processing'}
          />
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
            {getStatusIcon(document.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatFileSize(document.size)}</span>
              <span>•</span>
              <span className={`capitalize font-medium ${getStatusColor(document.status)}`}>
                {getStatusText(document.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {document.status === 'completed' && document.analysis && onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-gray-400 hover:text-blue-500"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={document.status === 'processing'}
            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {document.status === 'processing' && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600 font-medium">Analyzing document...</span>
            <span className="text-gray-500">Please wait</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="text-xs text-gray-500 text-center">
            Extracting content and generating insights
          </div>
        </div>
      )}

      {document.status === 'error' && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <div className="font-medium">Processing failed</div>
          <div>Please try uploading the document again or check the file format.</div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;


import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Trash2 
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
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
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
          />
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
            {getStatusIcon(document.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatFileSize(document.size)}</span>
              <span>•</span>
              <span className="capitalize">{document.status}</span>
              {document.status === 'processing' && (
                <div className="w-3 h-3 border border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              )}
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
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {document.status === 'processing' && (
        <div className="mt-3">
          <Progress value={65} className="h-1" />
        </div>
      )}
    </div>
  );
};

export default DocumentCard;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Trash2 } from "lucide-react";
import { ProcessedDocument } from "@/services/documentProcessingService";
import DocumentCard from "./DocumentCard";

interface DocumentLibraryProps {
  documents: ProcessedDocument[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onDeleteDocument: (id: string) => void;
  onExportDocument: (document: ProcessedDocument) => void;
}

const DocumentLibrary = ({
  documents,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onBulkDelete,
  onBulkExport,
  onDeleteDocument,
  onExportDocument
}: DocumentLibraryProps) => {
  if (documents.length === 0) {
    return null;
  }

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Document Library</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {documents.length} total
            </Badge>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {documents.length > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedFiles.size === documents.length}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : 'Select all'}
              </span>
            </div>
            
            {selectedFiles.size > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkExport}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              isSelected={selectedFiles.has(document.id)}
              onSelect={(checked) => onSelectFile(document.id, checked)}
              onDelete={() => onDeleteDocument(document.id)}
              onExport={() => onExportDocument(document)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentLibrary;

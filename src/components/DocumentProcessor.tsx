import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Brain,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Github,
  Linkedin,
  RefreshCw,
  MoreVertical,
  X,
  FileCheck,
  Clock,
  AlertTriangle
} from "lucide-react";
import { documentProcessingService, ProcessedDocument } from "@/services/documentProcessingService";

interface DocumentProcessorProps {
  onNavigate: (tab: string) => void;
}

const DocumentProcessor = ({ onNavigate }: DocumentProcessorProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
        const processingDoc: ProcessedDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          status: 'processing',
          uploadedAt: Date.now()
        };
        
        setUploadedFiles(prev => [...prev, processingDoc]);

        const processedDoc = await documentProcessingService.processDocument(file);
        
        setUploadedFiles(prev => 
          prev.map(doc => doc.id === processingDoc.id ? processedDoc : doc)
        );

        if (processedDoc.status === 'completed') {
          toast({
            title: "Document Processed",
            description: `${file.name} has been successfully analyzed.`,
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
        setUploadedFiles(prev => 
          prev.map(doc => doc.name === file.name && doc.status === 'processing' 
            ? { ...doc, status: 'error' as const } 
            : doc)
        );
        toast({
          title: "Processing Error",
          description: `Error processing ${file.name}.`,
          variant: "destructive",
        });
      }
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
  const latestAnalysis = completedFiles[completedFiles.length - 1]?.analysis;

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
                  <h1 className="text-lg font-bold text-gray-900">Document Processor</h1>
                  <p className="text-xs text-gray-500">Resume Analysis & Insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {uploadedFiles.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <FileCheck className="h-4 w-4" />
                  <span>{uploadedFiles.length} documents</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadExistingDocuments}
                className="text-gray-600 hover:text-pink-600"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-pink-600" />
                  <span>Upload Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume for AI-powered analysis and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-pink-200 hover:border-pink-300 hover:bg-pink-25'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supports PDF, TXT, DOCX, MD files up to 10MB
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx,.md"
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Management */}
            {uploadedFiles.length > 0 && (
              <Card className="border-pink-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Document Library</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {uploadedFiles.length} total
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Bulk Actions */}
                  {uploadedFiles.length > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedFiles.size === uploadedFiles.length}
                          onCheckedChange={handleSelectAll}
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
                            onClick={handleBulkExport}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBulkDelete}
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
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className={`p-4 rounded-lg border transition-all ${
                        selectedFiles.has(file.id) 
                          ? 'border-pink-300 bg-pink-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedFiles.has(file.id)}
                              onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                            />
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                              {getStatusIcon(file.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span className="capitalize">{file.status}</span>
                                {file.status === 'processing' && (
                                  <div className="w-3 h-3 border border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {file.status === 'completed' && file.analysis && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportAnalysis(file)}
                                className="text-gray-400 hover:text-blue-500"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {file.status === 'processing' && (
                          <div className="mt-3">
                            <Progress value={65} className="h-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {latestAnalysis ? (
              <>
                {/* Personal Information */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-pink-600" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{latestAnalysis.personalInfo.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{latestAnalysis.personalInfo.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{latestAnalysis.personalInfo.phone || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Linkedin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{latestAnalysis.personalInfo.linkedin || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Github className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{latestAnalysis.personalInfo.github || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Analysis */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-pink-600" />
                      <span>Skills Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {latestAnalysis.skills.technical.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                              {skill}
                            </Badge>
                          ))}
                          {latestAnalysis.skills.technical.length === 0 && (
                            <span className="text-sm text-gray-500">No technical skills detected</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Soft Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {latestAnalysis.skills.soft.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                              {skill}
                            </Badge>
                          ))}
                          {latestAnalysis.skills.soft.length === 0 && (
                            <span className="text-sm text-gray-500">No soft skills detected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-pink-600" />
                      <span>AI Insights & Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Overall Resume Score</span>
                          <span className="text-lg font-bold text-pink-600">{latestAnalysis.insights.overallScore}%</span>
                        </div>
                        <Progress value={latestAnalysis.insights.overallScore} className="h-2" />
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Strengths</h4>
                        <div className="space-y-2">
                          {latestAnalysis.insights.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {latestAnalysis.insights.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">AI Recommendations</h4>
                        <div className="space-y-2">
                          {latestAnalysis.insights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Brain className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-pink-100">
                <CardContent className="text-center py-16">
                  <FileText className="h-16 w-16 text-pink-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Processed</h3>
                  <p className="text-gray-500 mb-6">
                    Upload your resume to get started with AI-powered analysis and insights.
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor;

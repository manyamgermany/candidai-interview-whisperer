
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Linkedin
} from "lucide-react";

interface DocumentProcessorProps {
  onNavigate: (tab: string) => void;
}

const DocumentProcessor = ({ onNavigate }: DocumentProcessorProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'processing' | 'completed' | 'error';
    analysis?: any;
  }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockAnalysis = {
    personalInfo: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe"
    },
    skills: {
      technical: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"],
      soft: ["Leadership", "Communication", "Problem Solving", "Team Management"]
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        duration: "2021 - Present",
        highlights: ["Led team of 5 engineers", "Improved system performance by 40%", "Architected microservices platform"]
      },
      {
        title: "Software Engineer",
        company: "StartupCo",
        duration: "2019 - 2021",
        highlights: ["Built customer-facing web applications", "Implemented CI/CD pipeline", "Mentored junior developers"]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of Technology",
        year: "2019",
        gpa: "3.8/4.0"
      }
    ],
    certifications: [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional Developer",
      "Certified Scrum Master"
    ],
    insights: {
      overallScore: 92,
      strengths: ["Strong technical background", "Leadership experience", "Continuous learning"],
      improvements: ["Add more quantifiable achievements", "Include industry-specific keywords", "Expand on project outcomes"],
      matchScore: 87,
      recommendations: [
        "Highlight cloud architecture experience for cloud-focused roles",
        "Emphasize team leadership and mentoring skills",
        "Consider adding recent project portfolio links"
      ]
    }
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

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const fileObj = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing' as const
      };
      
      setUploadedFiles(prev => [...prev, fileObj]);
      
      // Simulate processing
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'completed' as const, analysis: mockAnalysis }
            : f
        ));
      }, 2000);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
                onClick={() => onNavigate("dashboard")}
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
                    Supports PDF, DOCX files up to 10MB
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
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'processing' && (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-gray-500">Processing...</span>
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {uploadedFiles.some(f => f.status === 'completed') ? (
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
                          <span className="text-sm">{mockAnalysis.personalInfo.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{mockAnalysis.personalInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{mockAnalysis.personalInfo.phone}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Linkedin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{mockAnalysis.personalInfo.linkedin}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Github className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{mockAnalysis.personalInfo.github}</span>
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
                          {mockAnalysis.skills.technical.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Soft Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockAnalysis.skills.soft.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-pink-600" />
                      <span>Professional Experience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockAnalysis.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-pink-200 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{exp.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {exp.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{exp.company}</p>
                          <ul className="space-y-1">
                            {exp.highlights.map((highlight, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                                <div className="w-1 h-1 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
                      {/* Overall Score */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Overall Resume Score</span>
                          <span className="text-lg font-bold text-pink-600">{mockAnalysis.insights.overallScore}%</span>
                        </div>
                        <Progress value={mockAnalysis.insights.overallScore} className="h-2" />
                      </div>

                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Strengths</h4>
                        <div className="space-y-2">
                          {mockAnalysis.insights.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {mockAnalysis.insights.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-3">AI Recommendations</h4>
                        <div className="space-y-2">
                          {mockAnalysis.insights.recommendations.map((rec, index) => (
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

                {/* Export Options */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5 text-pink-600" />
                      <span>Export Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Download your resume analysis in various formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4 mr-2" />
                        PDF Report
                      </Button>
                      <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4 mr-2" />
                        Excel Analysis
                      </Button>
                      <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Download className="h-4 w-4 mr-2" />
                        JSON Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-pink-100">
                <CardContent className="text-center py-16">
                  <FileText className="h-16 w-16 text-pink-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
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

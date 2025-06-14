
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, User, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileManager from "@/components/profile/ProfileManager";
import DocumentProcessor from "@/components/DocumentProcessor";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const {
    uploadedFiles,
    isProcessing,
    processingComplete
  } = useDocumentProcessor();

  const handleNavigate = (tab: string) => {
    if (tab === "back") {
      navigate("/");
    } else {
      navigate(`/${tab}`);
    }
  };

  // Get the latest completed document analysis
  const latestAnalysis = uploadedFiles.find(f => f.status === 'completed' && f.analysis)?.analysis;

  const handleDocumentUploaded = () => {
    // Switch to profile tab when document is processed
    if (processingComplete && latestAnalysis) {
      setActiveTab("profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => handleNavigate("back")}
            className="text-gray-600 hover:text-pink-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
            <p className="text-gray-600">Manage your profile for interviews, sales pitches, and meetings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile Details</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Document Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-pink-600" />
                  <span>Your Profile</span>
                </CardTitle>
                <CardDescription>
                  Manage your professional information for various scenarios - interviews, sales meetings, presentations
                  {latestAnalysis && (
                    <span className="block mt-2 text-green-600 font-medium">
                      ✓ Profile populated from uploaded document
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileManager 
                  initialData={latestAnalysis}
                  onNavigate={handleNavigate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-pink-600" />
                  <span>Upload Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume, CV, pitch deck, or any professional document to automatically populate your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentProcessor 
                  onNavigate={handleNavigate}
                  onDocumentProcessed={handleDocumentUploaded}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

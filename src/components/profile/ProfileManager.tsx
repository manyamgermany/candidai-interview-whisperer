
import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentAnalysis } from "@/types/documentTypes";
import { useProfileForm, ProfileFormData } from "@/hooks/useProfileForm";
import { useDocumentPopulation } from "@/hooks/useDocumentPopulation";
import PersonalInfoTab from "./PersonalInfoTab";
import ProfessionalTab from "./ProfessionalTab";
import ProjectsTab from "./ProjectsTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab from "./EducationTab";

interface ProfileManagerProps {
  initialData?: DocumentAnalysis;
  onNavigate: (tab: string) => void;
  onProfileUpdate?: (data: ProfileFormData) => void;
}

const ProfileManager = memo(({ initialData, onNavigate, onProfileUpdate }: ProfileManagerProps) => {
  const { toast } = useToast();
  const form = useProfileForm();
  const { isDataPopulated, refreshFromDocument } = useDocumentPopulation(form, initialData);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      localStorage.setItem('candidai-profile', JSON.stringify(data));
      onProfileUpdate?.(data);
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {initialData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">
                ✓ Profile populated from uploaded document: {initialData.personalInfo?.name || "Unknown"}
              </p>
              <p className="text-green-600 text-sm mt-1">
                Review and customize the information below as needed.
                {initialData.projects && initialData.projects.length > 0 && (
                  <span className="block mt-1">
                    📋 {initialData.projects.length} project(s) extracted and added to Projects tab
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshFromDocument}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="projects">
                Projects
                {form.watch("projects")?.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {form.watch("projects").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <PersonalInfoTab form={form} />
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <ProfessionalTab form={form} />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <ProjectsTab form={form} />
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <ExperienceTab form={form} />
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <EducationTab form={form} />
            </TabsContent>
          </Tabs>

          <div className="flex space-x-4">
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onNavigate("documents")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});

ProfileManager.displayName = "ProfileManager";

export default ProfileManager;

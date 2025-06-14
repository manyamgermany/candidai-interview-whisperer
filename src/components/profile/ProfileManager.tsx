
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentAnalysis } from "@/types/documentTypes";
import PersonalInfoTab from "./PersonalInfoTab";
import ProfessionalTab from "./ProfessionalTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab from "./EducationTab";

const profileSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    location: z.string().optional(),
  }),
  professionalSummary: z.string().min(10, "Professional summary must be at least 10 characters"),
  targetRole: z.string().min(2, "Target role is required"),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
  skills: z.object({
    technical: z.array(z.string()).min(1, "At least one technical skill is required"),
    soft: z.array(z.string()).min(1, "At least one soft skill is required"),
  }),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    highlights: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
    gpa: z.string().optional(),
  })),
  certifications: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileManagerProps {
  initialData?: DocumentAnalysis;
  onNavigate: (tab: string) => void;
  onProfileUpdate?: (data: ProfileFormData) => void;
}

const ProfileManager = ({ initialData, onNavigate, onProfileUpdate }: ProfileManagerProps) => {
  const { toast } = useToast();
  const [isDataPopulated, setIsDataPopulated] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        location: "",
      },
      professionalSummary: "",
      targetRole: "",
      experienceLevel: "mid",
      skills: {
        technical: [],
        soft: [],
      },
      experience: [],
      education: [],
      certifications: [],
    },
  });

  // Populate form with document data when available
  useEffect(() => {
    if (initialData && !isDataPopulated) {
      const formData: ProfileFormData = {
        personalInfo: {
          name: initialData.personalInfo?.name || "",
          email: initialData.personalInfo?.email || "",
          phone: initialData.personalInfo?.phone || "",
          linkedin: initialData.personalInfo?.linkedin || "",
          github: initialData.personalInfo?.github || "",
          location: initialData.personalInfo?.location || "",
        },
        professionalSummary: generateProfessionalSummary(initialData),
        targetRole: inferTargetRole(initialData),
        experienceLevel: inferExperienceLevel(initialData),
        skills: {
          technical: initialData.skills?.technical || [],
          soft: initialData.skills?.soft || [],
        },
        experience: initialData.experience || [],
        education: initialData.education || [],
        certifications: initialData.certifications || [],
      };
      
      form.reset(formData);
      setIsDataPopulated(true);
      
      toast({
        title: "Profile Populated",
        description: "Your profile has been populated from the uploaded document.",
      });
    }
  }, [initialData, form, toast, isDataPopulated]);

  // Reset populated state when initialData changes
  useEffect(() => {
    if (!initialData) {
      setIsDataPopulated(false);
    }
  }, [initialData]);

  const generateProfessionalSummary = (data: DocumentAnalysis): string => {
    const experience = data.experience?.length || 0;
    const skills = data.skills?.technical?.slice(0, 3).join(", ") || "various technologies";
    
    return `Experienced professional with ${experience}+ years in technology, specializing in ${skills}. Proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams.`;
  };

  const inferTargetRole = (data: DocumentAnalysis): string => {
    const experiences = data.experience || [];
    if (experiences.length > 0) {
      return experiences[0].title || "Software Engineer";
    }
    return "Software Engineer";
  };

  const inferExperienceLevel = (data: DocumentAnalysis): "entry" | "mid" | "senior" | "executive" => {
    const experienceCount = data.experience?.length || 0;
    if (experienceCount >= 3) return "senior";
    if (experienceCount >= 1) return "mid";
    return "entry";
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Save profile data to storage
      localStorage.setItem('candidai-profile', JSON.stringify(data));
      
      // Notify parent component
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

  const refreshFromDocument = () => {
    if (initialData) {
      setIsDataPopulated(false);
      // This will trigger the useEffect to repopulate the form
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <PersonalInfoTab form={form} />
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <ProfessionalTab form={form} />
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
};

export default ProfileManager;

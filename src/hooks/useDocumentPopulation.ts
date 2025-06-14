
import { useEffect, useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { DocumentAnalysis } from "@/types/documentTypes";
import { ProfileFormData } from "./useProfileForm";
import { useToast } from "@/hooks/use-toast";

export const useDocumentPopulation = (
  form: UseFormReturn<ProfileFormData>,
  initialData?: DocumentAnalysis
) => {
  const { toast } = useToast();
  const [isDataPopulated, setIsDataPopulated] = useState(false);

  const generateProfessionalSummary = useCallback((data: DocumentAnalysis): string => {
    const experience = data.experience?.length || 0;
    const skills = data.skills?.technical?.slice(0, 3).join(", ") || "various technologies";
    
    return `Experienced professional with ${experience}+ years in technology, specializing in ${skills}. Proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams.`;
  }, []);

  const inferTargetRole = useCallback((data: DocumentAnalysis): string => {
    const experiences = data.experience || [];
    if (experiences.length > 0) {
      return experiences[0].title || "Software Engineer";
    }
    return "Software Engineer";
  }, []);

  const inferExperienceLevel = useCallback((data: DocumentAnalysis): "entry" | "mid" | "senior" | "executive" => {
    const experienceCount = data.experience?.length || 0;
    if (experienceCount >= 3) return "senior";
    if (experienceCount >= 1) return "mid";
    return "entry";
  }, []);

  const populateForm = useCallback((data: DocumentAnalysis) => {
    const formData: ProfileFormData = {
      personalInfo: {
        name: data.personalInfo?.name || "",
        email: data.personalInfo?.email || "",
        phone: data.personalInfo?.phone || "",
        linkedin: data.personalInfo?.linkedin || "",
        github: data.personalInfo?.github || "",
        location: data.personalInfo?.location || "",
      },
      professionalSummary: generateProfessionalSummary(data),
      targetRole: inferTargetRole(data),
      experienceLevel: inferExperienceLevel(data),
      skills: {
        technical: data.skills?.technical || [],
        soft: data.skills?.soft || [],
      },
      experience: data.experience || [],
      education: data.education || [],
      certifications: data.certifications || [],
      projects: data.projects || [],
    };
    
    form.reset(formData);
    setIsDataPopulated(true);
    
    const projectsCount = data.projects?.length || 0;
    toast({
      title: "Profile Populated",
      description: `Your profile has been populated from the uploaded document${projectsCount > 0 ? ` including ${projectsCount} project(s)` : ''}.`,
    });
  }, [form, toast, generateProfessionalSummary, inferTargetRole, inferExperienceLevel]);

  useEffect(() => {
    if (initialData && !isDataPopulated) {
      populateForm(initialData);
    }
  }, [initialData, isDataPopulated, populateForm]);

  useEffect(() => {
    if (!initialData) {
      setIsDataPopulated(false);
    }
  }, [initialData]);

  const refreshFromDocument = useCallback(() => {
    if (initialData) {
      setIsDataPopulated(false);
    }
  }, [initialData]);

  return {
    isDataPopulated,
    refreshFromDocument,
  };
};

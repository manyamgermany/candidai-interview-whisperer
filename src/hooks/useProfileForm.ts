
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DocumentAnalysis } from "@/types/documentTypes";

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
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    role: z.string(),
    duration: z.string(),
    url: z.string().optional(),
    technologies: z.array(z.string()),
    achievements: z.array(z.string()),
  })),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
  return useForm<ProfileFormData>({
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
      projects: [],
    },
  });
};

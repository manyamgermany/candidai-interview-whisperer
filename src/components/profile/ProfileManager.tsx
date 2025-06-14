import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, GraduationCap, Award, Target, Plus, X, Save, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileManagerProps {
  initialData?: DocumentAnalysis;
  onNavigate: (tab: string) => void;
  onProfileUpdate?: (data: ProfileFormData) => void;
}

const ProfileManager = ({ initialData, onNavigate, onProfileUpdate }: ProfileManagerProps) => {
  const { toast } = useToast();
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newCertification, setNewCertification] = useState("");
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

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      const currentSkills = form.getValues("skills.technical");
      if (!currentSkills.includes(newTechnicalSkill.trim())) {
        form.setValue("skills.technical", [...currentSkills, newTechnicalSkill.trim()]);
        setNewTechnicalSkill("");
      }
    }
  };

  const removeTechnicalSkill = (skill: string) => {
    const currentSkills = form.getValues("skills.technical");
    form.setValue("skills.technical", currentSkills.filter(s => s !== skill));
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      const currentSkills = form.getValues("skills.soft");
      if (!currentSkills.includes(newSoftSkill.trim())) {
        form.setValue("skills.soft", [...currentSkills, newSoftSkill.trim()]);
        setNewSoftSkill("");
      }
    }
  };

  const removeSoftSkill = (skill: string) => {
    const currentSkills = form.getValues("skills.soft");
    form.setValue("skills.soft", currentSkills.filter(s => s !== skill));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      const currentCerts = form.getValues("certifications");
      if (!currentCerts.includes(newCertification.trim())) {
        form.setValue("certifications", [...currentCerts, newCertification.trim()]);
        setNewCertification("");
      }
    }
  };

  const removeCertification = (cert: string) => {
    const currentCerts = form.getValues("certifications");
    form.setValue("certifications", currentCerts.filter(c => c !== cert));
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Your basic contact and personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile</FormLabel>
                          <FormControl>
                            <Input placeholder="linkedin.com/in/johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub Profile</FormLabel>
                          <FormControl>
                            <Input placeholder="github.com/johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Professional Profile</span>
                  </CardTitle>
                  <CardDescription>
                    Your professional summary and target role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="professionalSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your professional background and key strengths..."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A compelling summary that highlights your experience and value proposition
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                              <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                              <SelectItem value="executive">Executive Level</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Technical Skills</label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          value={newTechnicalSkill}
                          onChange={(e) => setNewTechnicalSkill(e.target.value)}
                          placeholder="Add technical skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
                        />
                        <Button type="button" onClick={addTechnicalSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("skills.technical").map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{skill}</span>
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTechnicalSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Soft Skills</label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          value={newSoftSkill}
                          onChange={(e) => setNewSoftSkill(e.target.value)}
                          placeholder="Add soft skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                        />
                        <Button type="button" onClick={addSoftSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("skills.soft").map((skill, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <span>{skill}</span>
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeSoftSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Professional Experience</span>
                  </CardTitle>
                  <CardDescription>
                    Your work experience and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {form.watch("experience").length > 0 ? (
                    <div className="space-y-4">
                      {form.watch("experience").map((exp, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{exp.title}</h4>
                          <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                          {exp.highlights.length > 0 && (
                            <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                              {exp.highlights.map((highlight, i) => (
                                <li key={i}>{highlight}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No experience data available.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a resume or add experience manually in the Documents tab.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Education & Certifications</span>
                  </CardTitle>
                  <CardDescription>
                    Your educational background and professional certifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Education</h4>
                    {form.watch("education").length > 0 ? (
                      <div className="space-y-3">
                        {form.watch("education").map((edu, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h5 className="font-medium">{edu.degree}</h5>
                            <p className="text-gray-600">{edu.institution} • {edu.year}</p>
                            {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No education data available.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Certifications</h4>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Add certification"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      />
                      <Button type="button" onClick={addCertification} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("certifications").map((cert, index) => (
                        <Badge key={index} variant="default" className="flex items-center space-x-1">
                          <Award className="h-3 w-3" />
                          <span>{cert}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeCertification(cert)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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

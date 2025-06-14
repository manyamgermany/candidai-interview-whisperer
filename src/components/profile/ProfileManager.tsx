
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, User, Briefcase, Target } from "lucide-react";
import { UserProfile, UserProject, JobDescription, InterviewType, IndustryType } from "@/types/interviewTypes";
import { personalizedResponseService } from "@/services/personalizedResponseService";

export const ProfileManager = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [newProject, setNewProject] = useState<Partial<UserProject>>({
    name: "",
    description: "",
    technologies: [],
    role: "",
    achievements: [],
    duration: ""
  });

  useEffect(() => {
    const existingProfile = personalizedResponseService.getUserProfile();
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Initialize with basic structure
      setProfile({
        personalInfo: {
          name: "",
          currentRole: "",
          experience: "",
          industry: ""
        },
        projects: [],
        focusKeywords: [],
        targetIndustry: 'general',
        interviewType: 'general'
      });
    }
  }, []);

  const updatePersonalInfo = (field: string, value: string) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      personalInfo: {
        ...profile.personalInfo,
        [field]: value
      }
    };
    setProfile(updatedProfile);
    personalizedResponseService.setUserProfile(updatedProfile);
  };

  const addKeyword = () => {
    if (!profile || !newKeyword.trim()) return;
    
    const updatedKeywords = [...profile.focusKeywords, newKeyword.trim()];
    const updatedProfile = { ...profile, focusKeywords: updatedKeywords };
    setProfile(updatedProfile);
    personalizedResponseService.updateFocusKeywords(updatedKeywords);
    setNewKeyword("");
  };

  const removeKeyword = (index: number) => {
    if (!profile) return;
    
    const updatedKeywords = profile.focusKeywords.filter((_, i) => i !== index);
    const updatedProfile = { ...profile, focusKeywords: updatedKeywords };
    setProfile(updatedProfile);
    personalizedResponseService.updateFocusKeywords(updatedKeywords);
  };

  const addProject = () => {
    if (!profile || !newProject.name) return;
    
    const project: UserProject = {
      id: Date.now().toString(),
      name: newProject.name || "",
      description: newProject.description || "",
      technologies: newProject.technologies || [],
      role: newProject.role || "",
      achievements: newProject.achievements || [],
      duration: newProject.duration || "",
      url: newProject.url
    };

    const updatedProjects = [...profile.projects, project];
    const updatedProfile = { ...profile, projects: updatedProjects };
    setProfile(updatedProfile);
    personalizedResponseService.updateProjects(updatedProjects);
    
    setNewProject({
      name: "",
      description: "",
      technologies: [],
      role: "",
      achievements: [],
      duration: ""
    });
  };

  const updateJobDescription = (field: string, value: any) => {
    if (!profile) return;
    
    const updatedJobDescription = {
      ...profile.jobDescription,
      [field]: value
    } as JobDescription;
    
    const updatedProfile = { ...profile, jobDescription: updatedJobDescription };
    setProfile(updatedProfile);
    personalizedResponseService.updateJobDescription(updatedJobDescription);
  };

  const updateInterviewType = (interviewType: InterviewType) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, interviewType };
    setProfile(updatedProfile);
    personalizedResponseService.updateInterviewType(interviewType);
  };

  const updateTargetIndustry = (industry: IndustryType) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, targetIndustry: industry };
    setProfile(updatedProfile);
    personalizedResponseService.updateTargetIndustry(industry);
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Management</span>
          </CardTitle>
          <CardDescription>
            Customize your profile for personalized AI assistance during interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="target-role">Target Role</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={profile.personalInfo.currentRole}
                    onChange={(e) => updatePersonalInfo('currentRole', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={profile.personalInfo.experience} onValueChange={(value) => updatePersonalInfo('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="Mid Level (2-5 years)">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="Senior Level (5-10 years)">Senior Level (5-10 years)</SelectItem>
                      <SelectItem value="Executive Level (10+ years)">Executive Level (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">Current Industry</Label>
                  <Input
                    id="industry"
                    value={profile.personalInfo.industry}
                    onChange={(e) => updatePersonalInfo('industry', e.target.value)}
                    placeholder="e.g., Technology, Finance"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Project</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                  <Input
                    placeholder="Your role"
                    value={newProject.role}
                    onChange={(e) => setNewProject({...newProject, role: e.target.value})}
                  />
                </div>
                <Textarea
                  placeholder="Project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
                <Input
                  placeholder="Duration (e.g., 6 months, 2 years)"
                  value={newProject.duration}
                  onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                />
                <Button onClick={addProject} disabled={!newProject.name}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Current Projects ({profile.projects.length})</h4>
                {profile.projects.map((project, index) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{project.name}</h5>
                          <p className="text-sm text-gray-600">{project.role} • {project.duration}</p>
                          <p className="text-sm mt-1">{project.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          const updatedProjects = profile.projects.filter((_, i) => i !== index);
                          const updatedProfile = { ...profile, projects: updatedProjects };
                          setProfile(updatedProfile);
                          personalizedResponseService.updateProjects(updatedProjects);
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="target-role" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Industry</Label>
                  <Select value={profile.targetIndustry} onValueChange={updateTargetIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interview Type</Label>
                  <Select value={profile.interviewType} onValueChange={updateInterviewType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Interview</SelectItem>
                      <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                      <SelectItem value="managerial">Managerial Interview</SelectItem>
                      <SelectItem value="executive">Executive Interview</SelectItem>
                      <SelectItem value="sales-pitch">Sales Pitch</SelectItem>
                      <SelectItem value="client-meeting">Client Meeting</SelectItem>
                      <SelectItem value="vendor-meeting">Vendor Meeting</SelectItem>
                      <SelectItem value="board-meeting">Board Meeting</SelectItem>
                      <SelectItem value="team-meeting">Team Meeting</SelectItem>
                      <SelectItem value="performance-review">Performance Review</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Job Description (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Job title"
                    value={profile.jobDescription?.title || ""}
                    onChange={(e) => updateJobDescription('title', e.target.value)}
                  />
                  <Input
                    placeholder="Company name"
                    value={profile.jobDescription?.company || ""}
                    onChange={(e) => updateJobDescription('company', e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Key requirements (one per line)"
                  value={profile.jobDescription?.requirements?.join('\n') || ""}
                  onChange={(e) => updateJobDescription('requirements', e.target.value.split('\n').filter(r => r.trim()))}
                />
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add focus keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile.focusKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{keyword}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeKeyword(index)}
                    />
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                Add keywords you want to emphasize during interviews. These will be incorporated into AI suggestions.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Plus, X, Save, Briefcase } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";

interface ManualProfileFormProps {
  onSave: (analysis: DocumentAnalysis) => void;
  onCancel: () => void;
  initialData?: Partial<DocumentAnalysis>;
}

const ManualProfileForm = ({ onSave, onCancel, initialData }: ManualProfileFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: initialData?.personalInfo?.name || '',
    email: initialData?.personalInfo?.email || '',
    phone: initialData?.personalInfo?.phone || '',
    linkedin: initialData?.personalInfo?.linkedin || '',
    github: initialData?.personalInfo?.github || '',
    location: initialData?.personalInfo?.location || '',
    technicalSkills: initialData?.skills?.technical || [],
    softSkills: initialData?.skills?.soft || [],
    experience: initialData?.experience || [],
    education: initialData?.education || [],
    focusKeywords: [],
    careerSummary: '',
    currentRole: '',
    yearsOfExperience: '',
    keyAchievements: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    gpa: ''
  });

  const addSkill = (type: 'technical' | 'soft') => {
    const skill = type === 'technical' ? newSkill : newSoftSkill;
    if (skill.trim()) {
      setFormData(prev => ({
        ...prev,
        [type === 'technical' ? 'technicalSkills' : 'softSkills']: [
          ...prev[type === 'technical' ? 'technicalSkills' : 'softSkills'],
          skill.trim()
        ]
      }));
      if (type === 'technical') {
        setNewSkill('');
      } else {
        setNewSoftSkill('');
      }
    }
  };

  const removeSkill = (type: 'technical' | 'soft', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: 
        prev[type === 'technical' ? 'technicalSkills' : 'softSkills'].filter((_, i) => i !== index)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData(prev => ({
        ...prev,
        focusKeywords: [...prev.focusKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      focusKeywords: prev.focusKeywords.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, {
          ...newExperience,
          highlights: newExperience.description ? [newExperience.description] : []
        }]
      }));
      setNewExperience({ title: '', company: '', duration: '', description: '' });
    }
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
      setNewEducation({ degree: '', institution: '', year: '', gpa: '' });
    }
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const generateInsights = (): DocumentAnalysis['insights'] => {
    const technicalSkillCount = formData.technicalSkills.length;
    const softSkillCount = formData.softSkills.length;
    const experienceCount = formData.experience.length;
    const hasContact = !!(formData.email && formData.phone);
    
    let score = 50; // Base score for manual entry
    
    if (technicalSkillCount >= 8) score += 20;
    else if (technicalSkillCount >= 5) score += 15;
    else if (technicalSkillCount >= 3) score += 10;
    
    if (softSkillCount >= 5) score += 15;
    else if (softSkillCount >= 3) score += 10;
    
    if (experienceCount >= 3) score += 15;
    else if (experienceCount >= 2) score += 10;
    else if (experienceCount >= 1) score += 5;
    
    if (hasContact) score += 10;
    if (formData.linkedin) score += 5;
    if (formData.careerSummary) score += 5;
    if (formData.focusKeywords.length >= 5) score += 10;

    const finalScore = Math.min(score, 95);

    const strengths = [];
    const improvements = [];
    const recommendations = [];

    if (technicalSkillCount >= 5) {
      strengths.push(`Comprehensive technical skill set with ${technicalSkillCount} technologies`);
    } else {
      improvements.push('Consider adding more relevant technical skills');
    }

    if (formData.focusKeywords.length >= 5) {
      strengths.push(`Well-defined focus areas with ${formData.focusKeywords.length} key topics`);
    } else {
      improvements.push('Add more focus keywords for better interview preparation');
    }

    if (formData.careerSummary) {
      strengths.push('Clear career summary provided');
    } else {
      improvements.push('Add a career summary to highlight your professional journey');
    }

    recommendations.push('Use your focus keywords strategically during interviews');
    recommendations.push('Prepare specific examples for each key skill mentioned');
    recommendations.push('Practice explaining your experience using the STAR method');
    
    if (formData.focusKeywords.length > 0) {
      recommendations.push(`Focus on: ${formData.focusKeywords.slice(0, 3).join(', ')} during your interview`);
    }

    return {
      overallScore: finalScore,
      strengths,
      improvements,
      matchScore: Math.max(finalScore - 5, 0),
      recommendations
    };
  };

  const handleSave = () => {
    if (!formData.name || formData.technicalSkills.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide at least your name and some technical skills.",
        variant: "destructive",
      });
      return;
    }

    const analysis: DocumentAnalysis = {
      personalInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        github: formData.github,
        location: formData.location
      },
      skills: {
        technical: formData.technicalSkills,
        soft: formData.softSkills
      },
      experience: formData.experience,
      education: formData.education,
      certifications: [],
      insights: generateInsights()
    };

    // Store focus keywords and additional info in localStorage for interview assistant
    localStorage.setItem('userFocusKeywords', JSON.stringify(formData.focusKeywords));
    localStorage.setItem('userCareerSummary', formData.careerSummary);
    localStorage.setItem('userCurrentRole', formData.currentRole);
    localStorage.setItem('userKeyAchievements', formData.keyAchievements);

    onSave(analysis);
    
    toast({
      title: "Profile Saved",
      description: "Your manual profile has been created successfully!",
    });
  };

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-pink-600" />
          <span>Create Manual Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                placeholder="github.com/yourusername"
              />
            </div>
          </div>
        </div>

        {/* Career Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Career Overview</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentRole">Current Role</Label>
              <Input
                id="currentRole"
                value={formData.currentRole}
                onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                placeholder="5 years"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="careerSummary">Career Summary</Label>
            <Textarea
              id="careerSummary"
              value={formData.careerSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, careerSummary: e.target.value }))}
              placeholder="Brief overview of your career journey and key achievements..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="keyAchievements">Key Achievements</Label>
            <Textarea
              id="keyAchievements"
              value={formData.keyAchievements}
              onChange={(e) => setFormData(prev => ({ ...prev, keyAchievements: e.target.value }))}
              placeholder="Your most significant professional achievements..."
              rows={3}
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Technical Skills *</h3>
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add technical skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill('technical')}
            />
            <Button onClick={() => addSkill('technical')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technicalSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {skill}
                <button onClick={() => removeSkill('technical', index)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Soft Skills</h3>
          <div className="flex space-x-2">
            <Input
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              placeholder="Add soft skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill('soft')}
            />
            <Button onClick={() => addSkill('soft')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.softSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                {skill}
                <button onClick={() => removeSkill('soft', index)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Focus Keywords */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Interview Focus Keywords</h3>
          <p className="text-sm text-gray-600">Add keywords you want to emphasize during interviews</p>
          <div className="flex space-x-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add focus keyword"
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.focusKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
                {keyword}
                <button onClick={() => removeKeyword(index)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Experience</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              value={newExperience.title}
              onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Job Title"
            />
            <Input
              value={newExperience.company}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Company Name"
            />
            <Input
              value={newExperience.duration}
              onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="Duration (e.g., 2020-2023)"
            />
            <Button onClick={addExperience} size="sm" className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
          <Textarea
            value={newExperience.description}
            onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Key responsibilities and achievements..."
            rows={2}
          />
          <div className="space-y-2">
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  <p className="text-sm text-gray-600">{exp.duration}</p>
                </div>
                <Button onClick={() => removeExperience(index)} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Education</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              value={newEducation.degree}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              placeholder="Degree"
            />
            <Input
              value={newEducation.institution}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="Institution"
            />
            <Input
              value={newEducation.year}
              onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
              placeholder="Year"
            />
            <Button onClick={addEducation} size="sm" className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
          <div className="space-y-2">
            {formData.education.map((edu, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution} - {edu.year}</p>
                </div>
                <Button onClick={() => removeEducation(index)} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualProfileForm;

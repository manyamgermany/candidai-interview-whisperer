
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { DocumentAnalysis } from "@/types/documentTypes";

interface EditableAnalysisCardProps {
  analysis: DocumentAnalysis;
  onSave: (updatedAnalysis: DocumentAnalysis) => void;
}

const EditableAnalysisCard = ({ analysis, onSave }: EditableAnalysisCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<DocumentAnalysis>(analysis);

  const handleSave = () => {
    onSave(editedAnalysis);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAnalysis(analysis);
    setIsEditing(false);
  };

  const addSkill = (type: 'technical' | 'soft') => {
    setEditedAnalysis(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: [...prev.skills[type], '']
      }
    }));
  };

  const removeSkill = (type: 'technical' | 'soft', index: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((_, i) => i !== index)
      }
    }));
  };

  const updateSkill = (type: 'technical' | 'soft', index: number, value: string) => {
    setEditedAnalysis(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].map((skill, i) => i === index ? value : skill)
      }
    }));
  };

  const addExperience = () => {
    setEditedAnalysis(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        duration: '',
        highlights: ['']
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setEditedAnalysis(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addHighlight = (expIndex: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, highlights: [...exp.highlights, ''] } : exp
      )
    }));
  };

  const updateHighlight = (expIndex: number, highlightIndex: number, value: string) => {
    setEditedAnalysis(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? {
          ...exp, 
          highlights: exp.highlights.map((h, j) => j === highlightIndex ? value : h)
        } : exp
      )
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Analysis</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="font-semibold mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              {isEditing ? (
                <Input
                  value={editedAnalysis.personalInfo.name}
                  onChange={(e) => setEditedAnalysis(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, name: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{analysis.personalInfo.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              {isEditing ? (
                <Input
                  value={editedAnalysis.personalInfo.email}
                  onChange={(e) => setEditedAnalysis(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{analysis.personalInfo.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              {isEditing ? (
                <Input
                  value={editedAnalysis.personalInfo.phone}
                  onChange={(e) => setEditedAnalysis(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{analysis.personalInfo.phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              {isEditing ? (
                <Input
                  value={editedAnalysis.personalInfo.location || ''}
                  onChange={(e) => setEditedAnalysis(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm text-gray-600">{analysis.personalInfo.location || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-3">Skills</h3>
          
          {/* Technical Skills */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Technical Skills</label>
              {isEditing && (
                <Button onClick={() => addSkill('technical')} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                editedAnalysis.skills.technical.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill('technical', index, e.target.value)}
                      className="w-24 h-8"
                    />
                    <Button
                      onClick={() => removeSkill('technical', index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                analysis.skills.technical.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))
              )}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Soft Skills</label>
              {isEditing && (
                <Button onClick={() => addSkill('soft')} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                editedAnalysis.skills.soft.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill('soft', index, e.target.value)}
                      className="w-24 h-8"
                    />
                    <Button
                      onClick={() => removeSkill('soft', index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                analysis.skills.soft.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Experience</h3>
            {isEditing && (
              <Button onClick={addExperience} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </Button>
            )}
          </div>
          {editedAnalysis.experience.length === 0 ? (
            <p className="text-sm text-gray-500">No experience entries found</p>
          ) : (
            editedAnalysis.experience.map((exp, index) => (
              <div key={index} className="border rounded p-4 mb-4">
                {isEditing && (
                  <div className="flex justify-end mb-2">
                    <Button
                      onClick={() => removeExperience(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    {isEditing ? (
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{exp.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    {isEditing ? (
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{exp.company}</p>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-sm font-medium">Duration</label>
                  {isEditing ? (
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{exp.duration}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Highlights</label>
                    {isEditing && (
                      <Button onClick={() => addHighlight(index)} size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {exp.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="mb-2">
                      {isEditing ? (
                        <Textarea
                          value={highlight}
                          onChange={(e) => updateHighlight(index, hIndex, e.target.value)}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm">• {highlight}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableAnalysisCard;

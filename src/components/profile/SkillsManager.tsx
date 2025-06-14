
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface SkillsManagerProps {
  form: UseFormReturn<any>;
  skillType: 'technical' | 'soft';
  placeholder: string;
  badgeVariant?: 'secondary' | 'outline';
  badgeClassName?: string;
}

const SkillsManager = ({ 
  form, 
  skillType, 
  placeholder, 
  badgeVariant = 'secondary',
  badgeClassName = ''
}: SkillsManagerProps) => {
  const [newSkill, setNewSkill] = useState("");
  const fieldPath = `skills.${skillType}`;

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues(fieldPath);
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue(fieldPath, [...currentSkills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues(fieldPath);
    form.setValue(fieldPath, currentSkills.filter((s: string) => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" onClick={addSkill} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {form.watch(fieldPath).map((skill: string, index: number) => (
          <Badge 
            key={index} 
            variant={badgeVariant} 
            className={`flex items-center space-x-1 ${badgeClassName}`}
          >
            <span>{skill}</span>
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeSkill(skill)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillsManager;

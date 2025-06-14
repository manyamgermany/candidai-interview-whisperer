
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Award } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface CertificationsManagerProps {
  form: UseFormReturn<any>;
}

const CertificationsManager = ({ form }: CertificationsManagerProps) => {
  const [newCertification, setNewCertification] = useState("");

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
    form.setValue("certifications", currentCerts.filter((c: string) => c !== cert));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCertification();
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-3">Certifications</h4>
      <div className="flex space-x-2 mb-3">
        <Input
          value={newCertification}
          onChange={(e) => setNewCertification(e.target.value)}
          placeholder="Add certification"
          onKeyPress={handleKeyPress}
        />
        <Button type="button" onClick={addCertification} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {form.watch("certifications").map((cert: string, index: number) => (
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
  );
};

export default CertificationsManager;


import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import SkillsManager from "./SkillsManager";

interface ProfessionalTabProps {
  form: UseFormReturn<any>;
}

const ProfessionalTab = ({ form }: ProfessionalTabProps) => {
  return (
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
            <SkillsManager
              form={form}
              skillType="technical"
              placeholder="Add technical skill"
              badgeVariant="secondary"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Soft Skills</label>
            <SkillsManager
              form={form}
              skillType="soft"
              placeholder="Add soft skill"
              badgeVariant="outline"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalTab;


import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import { useToast } from "@/hooks/use-toast";

export const Sidebar = memo(() => {
  const { toast } = useToast();
  
  const handleAnalysisComplete = (analysis: any) => {
    toast({
      title: "Screen Analysis Ready",
      description: `Found ${analysis.keyPoints?.length || 0} key points and ${analysis.questions?.length || 0} potential questions`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">AI Screen Analysis</h3>
            <ScreenshotAnalyzer 
              onAnalysisComplete={handleAnalysisComplete}
              className="mx-auto"
            />
            <p className="text-sm text-gray-600 mt-3">
              Instantly analyze any screen content with AI
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

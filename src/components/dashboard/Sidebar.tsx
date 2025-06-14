
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import { useToast } from "@/hooks/use-toast";

export const Sidebar = memo(() => {
  const { toast } = useToast();

  const handleAnalysisComplete = (analysis: any) => {
    toast({
      title: "Screen Analysis Ready",
      description: `Found ${analysis.keyPoints?.length || 0} key points and ${analysis.questions?.length || 0} potential questions`,
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-gray-900">Quick Tools</h3>
              <div className="flex justify-center">
                <ScreenshotAnalyzer 
                  onAnalysisComplete={handleAnalysisComplete}
                  className="h-14 w-14"
                />
              </div>
              <p className="text-xs text-gray-600">
                Instantly analyze any screen content with AI
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

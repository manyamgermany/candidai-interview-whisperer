import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import { useToast } from "@/hooks/use-toast";
export const Sidebar = memo(() => {
  const {
    toast
  } = useToast();
  const handleAnalysisComplete = (analysis: any) => {
    toast({
      title: "Screen Analysis Ready",
      description: `Found ${analysis.keyPoints?.length || 0} key points and ${analysis.questions?.length || 0} potential questions`
    });
  };
  return;
});
Sidebar.displayName = 'Sidebar';
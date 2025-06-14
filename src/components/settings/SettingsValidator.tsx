
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Info, Lightbulb } from "lucide-react";

interface SettingsValidatorProps {
  settings: any;
  onFixIssue: (fix: any) => void;
}

export const SettingsValidator = ({ settings, onFixIssue }: SettingsValidatorProps) => {
  const [validationResults, setValidationResults] = useState<any[]>([]);

  useEffect(() => {
    validateSettings();
  }, [settings]);

  const validateSettings = () => {
    const issues = [];

    // Check for missing API keys
    if (!settings.aiProvider?.openaiKey && !settings.aiProvider?.claudeKey && !settings.aiProvider?.geminiKey) {
      issues.push({
        type: "error",
        category: "API Configuration",
        message: "No API keys configured",
        description: "At least one AI provider API key is required for the application to function.",
        fix: { action: "navigate", target: "providers" }
      });
    }

    // Check for incompatible model selections
    if (settings.aiProvider?.primary === "openai" && !settings.aiProvider?.openaiKey) {
      issues.push({
        type: "error",
        category: "Model Configuration", 
        message: "Primary provider has no API key",
        description: "OpenAI is set as primary but no API key is configured.",
        fix: { action: "setProvider", value: "claude" }
      });
    }

    // Check for performance issues
    if (settings.responseStyle?.length === "comprehensive" && settings.coaching?.enableRealtime) {
      issues.push({
        type: "warning",
        category: "Performance",
        message: "Potential latency issue",
        description: "Comprehensive responses with real-time coaching may cause delays.",
        fix: { action: "setSetting", path: ["responseStyle", "length"], value: "medium" }
      });
    }

    // Check for audio conflicts
    if (settings.audio?.noiseReduction && settings.audio?.autoGainControl === false) {
      issues.push({
        type: "warning",
        category: "Audio Configuration",
        message: "Suboptimal audio settings",
        description: "Noise reduction without auto gain control may reduce audio quality.",
        fix: { action: "setSetting", path: ["audio", "autoGainControl"], value: true }
      });
    }

    // Check for privacy conflicts
    if (settings.analytics?.enableTracking && settings.privacy?.localDataProcessing) {
      issues.push({
        type: "info",
        category: "Privacy",
        message: "Conflicting privacy settings",
        description: "Analytics tracking is enabled while local processing is preferred.",
        fix: { action: "setSetting", path: ["analytics", "enableTracking"], value: false }
      });
    }

    // Performance optimization suggestions
    if (settings.aiProvider?.models?.openai === "gpt-4o" && !settings.coaching?.enableRealtime) {
      issues.push({
        type: "suggestion",
        category: "Optimization",
        message: "Model optimization opportunity",
        description: "You could use a faster model since real-time coaching is disabled.",
        fix: { action: "setSetting", path: ["aiProvider", "models", "openai"], value: "gpt-4o-mini" }
      });
    }

    setValidationResults(issues);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      case "suggestion": return <Lightbulb className="h-4 w-4 text-purple-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-100 text-red-700 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "info": return "bg-blue-100 text-blue-700 border-blue-200";
      case "suggestion": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const applyFix = (issue: any) => {
    onFixIssue(issue.fix);
  };

  if (validationResults.length === 0) {
    return (
      <Card className="border-green-100">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-medium text-green-900 mb-1">Configuration Valid</h3>
          <p className="text-sm text-green-700">
            All settings are properly configured with no conflicts detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Settings Validation</span>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {validationResults.length} issue{validationResults.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationResults.map((issue, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{issue.message}</span>
                    <Badge variant="secondary" className={getBadgeColor(issue.type)}>
                      {issue.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </div>
              </div>
              {issue.fix && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFix(issue)}
                  className="ml-3 border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Fix
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

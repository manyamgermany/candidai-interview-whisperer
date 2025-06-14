import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Globe, Eye, RefreshCw, Lightbulb } from "lucide-react";

interface ResponseConfigSectionProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const ResponseConfigSection = ({ settings, onSettingsChange }: ResponseConfigSectionProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [sampleResponse, setSampleResponse] = useState("");

  const responseStyles = [
    { 
      id: "professional", 
      name: "Professional", 
      description: "Formal, structured responses suitable for business contexts",
      example: "Based on your presentation, I recommend focusing on three key areas: content structure, delivery confidence, and audience engagement strategies."
    },
    { 
      id: "conversational", 
      name: "Conversational", 
      description: "Natural, friendly tone for comfortable interactions",
      example: "Great job on your presentation! I noticed a few things that could help you feel more confident next time. Let's talk about pacing and how to handle those 'um' moments."
    },
    { 
      id: "technical", 
      name: "Technical", 
      description: "Detailed, analytical language for in-depth feedback",
      example: "Analysis indicates vocal filler frequency of 2.3 instances per minute, with pitch variance suggesting confidence fluctuation during technical explanations."
    },
    { 
      id: "concise", 
      name: "Concise", 
      description: "Brief, to-the-point responses for quick feedback",
      example: "Good pace. Reduce 'um' usage. Maintain eye contact. Strong closing."
    }
  ];

  const lengthLabels = ["Brief", "Short", "Medium", "Detailed", "Comprehensive"];
  const lengthDescriptions = [
    "1-2 sentences, key points only",
    "2-3 sentences, essential feedback", 
    "1 paragraph, balanced detail",
    "2-3 paragraphs, thorough analysis",
    "Multiple paragraphs, comprehensive insights"
  ];

  const updateResponseStyle = (styleId: string) => {
    const newSettings = {
      ...settings,
      responseStyle: {
        ...settings.responseStyle,
        tone: styleId
      }
    };
    onSettingsChange(newSettings);
  };

  const updateResponseLength = (lengthValue: number[]) => {
    const lengthMap = ["brief", "short", "medium", "detailed", "comprehensive"];
    const newSettings = {
      ...settings,
      responseStyle: {
        ...settings.responseStyle,
        length: lengthMap[lengthValue[0] - 1]
      }
    };
    onSettingsChange(newSettings);
  };

  const generatePreview = () => {
    const currentStyle = responseStyles.find(s => s.id === settings.responseStyle?.tone) || responseStyles[0];
    const currentLength = settings.responseStyle?.length || "medium";
    
    let preview = currentStyle.example;
    
    // Adjust preview based on length setting
    switch (currentLength) {
      case "brief":
        preview = preview.split('.')[0] + '.';
        break;
      case "short":
        preview = preview.split('.').slice(0, 2).join('.') + '.';
        break;
      case "detailed":
        preview += " Additionally, consider incorporating storytelling techniques to enhance audience connection and improve retention of key messages.";
        break;
      case "comprehensive":
        preview += " Additionally, consider incorporating storytelling techniques to enhance audience connection and improve retention of key messages. Furthermore, practice sessions with varied audience types can help develop adaptive communication skills.";
        break;
    }
    
    setSampleResponse(preview);
    setPreviewMode(true);
  };

  const getCurrentLengthIndex = () => {
    const lengthMap = { "brief": 1, "short": 2, "medium": 3, "detailed": 4, "comprehensive": 5 };
    return lengthMap[settings.responseStyle?.length as keyof typeof lengthMap] || 3;
  };

  return (
    <div className="space-y-6">
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-pink-600" />
            <span>Response Configuration</span>
          </CardTitle>
          <CardDescription>
            Customize how AI provides suggestions and feedback with live preview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Response Style Selection */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 block">
              Response Style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {responseStyles.map((style) => (
                <div 
                  key={style.id} 
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    settings.responseStyle?.tone === style.id 
                      ? 'border-pink-300 bg-pink-50 ring-2 ring-pink-200' 
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                  onClick={() => updateResponseStyle(style.id)}
                  role="radio"
                  aria-checked={settings.responseStyle?.tone === style.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      updateResponseStyle(style.id);
                    }
                  }}
                >
                  <input
                    type="radio"
                    id={style.id}
                    name="responseStyle"
                    value={style.id}
                    checked={settings.responseStyle?.tone === style.id}
                    onChange={() => updateResponseStyle(style.id)}
                    className="absolute top-4 right-4 w-4 h-4 text-pink-600 focus:ring-pink-500"
                    aria-describedby={`${style.id}-description`}
                  />
                  <div className="pr-8">
                    <h4 className="font-medium text-gray-900 mb-1">{style.name}</h4>
                    <p id={`${style.id}-description`} className="text-sm text-gray-500 mb-3">
                      {style.description}
                    </p>
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded italic">
                      "{style.example}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Length Slider */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 block">
              Response Length: <span className="text-pink-600 font-semibold">
                {lengthLabels[getCurrentLengthIndex() - 1]}
              </span>
            </label>
            <div className="space-y-3">
              <Slider
                value={[getCurrentLengthIndex()]}
                onValueChange={updateResponseLength}
                max={5}
                min={1}
                step={1}
                className="w-full"
                aria-label="Response length setting"
              />
              <div className="flex justify-between text-xs text-gray-500">
                {lengthLabels.map((label, index) => (
                  <span key={label} className="text-center flex-1">
                    {label}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-900">Current Setting:</span>
                    <p className="text-blue-800 mt-1">
                      {lengthDescriptions[getCurrentLengthIndex() - 1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                Response Preview
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>
            </div>
            
            {previewMode && (
              <div className="border border-pink-200 rounded-lg p-4 bg-pink-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-pink-900">Sample Response</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generatePreview}
                    className="h-6 w-6 p-0 text-pink-600 hover:text-pink-800"
                    aria-label="Regenerate preview"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm text-gray-700 bg-white p-3 rounded border border-pink-200">
                  "{sampleResponse}"
                </div>
                <div className="mt-2 text-xs text-pink-700">
                  Style: {responseStyles.find(s => s.id === settings.responseStyle?.tone)?.name} • 
                  Length: {lengthLabels[getCurrentLengthIndex() - 1]}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Advanced Response Options</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Include Confidence Scores</h5>
                  <p className="text-sm text-gray-500">Show numerical confidence ratings with feedback</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.responseStyle?.includeConfidence ?? true}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    responseStyle: {
                      ...settings.responseStyle,
                      includeConfidence: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Suggest Improvements</h5>
                  <p className="text-sm text-gray-500">Include actionable improvement suggestions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.responseStyle?.includeSuggestions ?? true}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    responseStyle: {
                      ...settings.responseStyle,
                      includeSuggestions: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Contextual Examples</h5>
                  <p className="text-sm text-gray-500">Provide specific examples relevant to your content</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.responseStyle?.includeExamples ?? false}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    responseStyle: {
                      ...settings.responseStyle,
                      includeExamples: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

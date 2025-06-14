
import { memo } from "react";
import { Badge } from "@/components/ui/badge";

interface AIFeaturesIndicatorProps {
  sessionActive: boolean;
}

const features = [
  "Personalized Suggestions",
  "Performance Tracking",
  "Industry-Specific Coaching",
  "Live Analytics"
];

export const AIFeaturesIndicator = memo(({ sessionActive }: AIFeaturesIndicatorProps) => {
  if (!sessionActive) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">AI Features Active:</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {features.map((feature) => (
          <div key={feature} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

AIFeaturesIndicator.displayName = 'AIFeaturesIndicator';

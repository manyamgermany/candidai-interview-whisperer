
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranscriptDisplayProps {
  transcript: string;
}

export const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  if (!transcript) return null;

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="text-lg">Live Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcript}</p>
        </div>
      </CardContent>
    </Card>
  );
};

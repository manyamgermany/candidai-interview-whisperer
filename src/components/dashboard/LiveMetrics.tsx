
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeechAnalytics } from "@/services/speechService";

interface LiveMetricsProps {
  analytics: SpeechAnalytics;
  transcript: string;
}

export const LiveMetrics = ({ analytics, transcript }: LiveMetricsProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="text-lg">Live Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{analytics.wordsPerMinute}</div>
            <div className="text-sm text-gray-500">WPM</div>
            <div className="text-xs text-green-600">
              {analytics.wordsPerMinute >= 120 && analytics.wordsPerMinute <= 150 ? 'Optimal' : 'Adjust Pace'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{analytics.fillerWords}</div>
            <div className="text-sm text-gray-500">Filler Words</div>
            <div className="text-xs text-orange-600">
              {analytics.fillerWords < 5 ? 'Good' : 'Monitor Usage'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.confidenceScore}%</div>
            <div className="text-sm text-gray-500">Confidence</div>
            <div className="text-xs text-blue-600">
              {analytics.confidenceScore > 80 ? 'Strong' : 'Building'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{transcript.split(' ').length}</div>
            <div className="text-sm text-gray-500">Words</div>
            <div className="text-xs text-purple-600">Spoken</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

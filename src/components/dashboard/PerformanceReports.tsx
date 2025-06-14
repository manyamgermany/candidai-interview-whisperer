
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PerformanceReport } from "@/types/interviewTypes";
import { BarChart3, Clock, Star, Target, TrendingUp, CheckCircle } from "lucide-react";

interface PerformanceReportsProps {
  latestReport: PerformanceReport | null;
}

export const PerformanceReports = ({ latestReport }: PerformanceReportsProps) => {
  if (!latestReport) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Reports Yet</h3>
          <p className="text-gray-500">Complete a session to generate your first performance report.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span>Performance Analysis</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {latestReport.interviewType.charAt(0).toUpperCase() + latestReport.interviewType.slice(1)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Detailed analysis from your {new Date(latestReport.timestamp).toLocaleDateString()} session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Math.round(latestReport.duration)}m</div>
              <div className="text-sm text-gray-500">Duration</div>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{latestReport.industry}</div>
              <div className="text-sm text-gray-500">Industry</div>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(latestReport.metrics.overallScore)}`}>
                {latestReport.metrics.overallScore}%
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{latestReport.recommendations.length}</div>
              <div className="text-sm text-gray-500">Recommendations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed breakdown of your interview performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(latestReport.metrics).map(([key, value]) => {
              if (key === 'overallScore') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{label}</span>
                    <span className={`font-bold ${getScoreColor(value)}`}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Speaking Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Speaking Pace</h4>
              <div className="flex justify-between">
                <span>{latestReport.analytics.speakingPace.wordsPerMinute} WPM</span>
                <Badge className={latestReport.analytics.speakingPace.optimal ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {latestReport.analytics.speakingPace.optimal ? "Optimal" : "Needs Work"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{latestReport.analytics.speakingPace.recommendation}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Filler Words</h4>
              <div className="flex justify-between">
                <span>{latestReport.analytics.fillerWords.count} words ({latestReport.analytics.fillerWords.percentage.toFixed(1)}%)</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{latestReport.analytics.fillerWords.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Content Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Response Structure</h4>
              <div className="flex justify-between">
                <span>Framework Usage</span>
                <Badge className={latestReport.analytics.responseStructure.usedFramework ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {latestReport.analytics.responseStructure.usedFramework ? "Used" : "Not Used"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{latestReport.analytics.responseStructure.recommendation}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Content Relevance</h4>
              <Progress value={latestReport.analytics.contentQuality.relevance} className="h-2 mb-2" />
              <p className="text-sm text-gray-600">{latestReport.analytics.contentQuality.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & Next Steps */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestReport.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestReport.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths */}
      {latestReport.analytics.strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {latestReport.analytics.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

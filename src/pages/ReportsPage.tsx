
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp } from "lucide-react";
import { PerformanceReport } from "@/types/interviewTypes";

const ReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [latestReport] = useState<PerformanceReport | null>(
    location.state?.latestReport || null
  );

  const mockReport: PerformanceReport = {
    sessionId: "session_123",
    timestamp: Date.now(),
    duration: "15:30",
    analytics: {
      wordsPerMinute: 145,
      fillerWords: 8,
      pauseDuration: 120,
      confidenceScore: 85,
      totalWords: 362,
      speakingTime: 900
    },
    transcript: "Sample interview transcript with behavioral questions and responses...",
    suggestions: [
      {
        id: "1",
        suggestion: "Great use of the STAR method in your response!",
        confidence: 92,
        type: "answer",
        timestamp: Date.now(),
        context: "Behavioral question response"
      }
    ],
    overallScore: 85,
    strengths: ["Clear communication", "Good structure", "Relevant examples"],
    improvements: ["Reduce filler words", "Speak slightly slower"]
  };

  const report = latestReport || mockReport;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-pink-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Report</h1>
              <p className="text-gray-600">Session analysis and insights</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="border-pink-200 text-pink-600">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Session Overview */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-pink-600" />
                <span>Session Overview</span>
                <Badge className="bg-green-100 text-green-700">
                  Score: {report.overallScore}%
                </Badge>
              </CardTitle>
              <CardDescription>
                Duration: {report.duration} • {new Date(report.timestamp).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{report.analytics.wordsPerMinute}</div>
                  <div className="text-sm text-gray-600">Words/Min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{report.analytics.fillerWords}</div>
                  <div className="text-sm text-gray-600">Filler Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report.analytics.confidenceScore}%</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{report.analytics.totalWords}</div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                  <TrendingUp className="h-5 w-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">AI Suggestions During Session</CardTitle>
              <CardDescription>
                {report.suggestions.length} suggestions provided during your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-900 font-medium">{suggestion.suggestion}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {suggestion.type}
                      </Badge>
                      <span className="text-xs text-blue-600">
                        Confidence: {suggestion.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

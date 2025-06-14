
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";

const ReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Generate sample report data
    const sampleReport = {
      sessionId: "sample-session-1",
      timestamp: Date.now(),
      overallScore: 87,
      analytics: {
        speakingPace: 155,
        responseStructure: 85,
        contentQuality: 80,
        confidence: 75,
        fillerWords: { 
          count: 5, 
          percentage: 2.1, 
          types: ['um', 'uh'], 
          recommendation: 'Practice pausing instead of using filler words' 
        },
        vocabulary: 250
      },
      strengths: [
        'Clear articulation and good speaking pace',
        'Well-structured responses using frameworks',
        'Confident delivery with minimal hesitation'
      ],
      improvements: [
        'Reduce use of filler words',
        'Provide more specific examples with metrics',
        'Practice smoother transitions between topics'
      ],
      suggestions: [
        'Use the STAR method for behavioral questions',
        'Prepare 3-5 specific examples with quantifiable results',
        'Practice active listening techniques'
      ]
    };
    
    setReports([sampleReport]);
  }, []);

  const handleNavigate = (tab: string) => {
    if (tab === "back") {
      navigate("/");
    } else {
      navigate(`/${tab}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => handleNavigate("back")}
            className="text-gray-600 hover:text-pink-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
            <p className="text-gray-600">Review your session analytics and improvement insights</p>
          </div>
        </div>

        <div className="space-y-6">
          {reports.map((report: any) => (
            <Card key={report.sessionId} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Session Report</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(report.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {report.overallScore}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Analytics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.analytics.speakingPace}
                    </div>
                    <p className="text-sm text-gray-600">Words/Min</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {report.analytics.fillerWords.count}
                    </div>
                    <p className="text-sm text-gray-600">Filler Words</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {report.analytics.confidence}%
                    </div>
                    <p className="text-sm text-gray-600">Confidence</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {report.analytics.vocabulary}
                    </div>
                    <p className="text-sm text-gray-600">Vocabulary</p>
                  </div>
                </div>

                {/* Strengths Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {report.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 mr-3">
                          ✓
                        </Badge>
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Target className="h-5 w-5 text-orange-600 mr-2" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {report.improvements.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 mr-3">
                          !
                        </Badge>
                        <span className="text-sm">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    {report.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 mr-3">
                          💡
                        </Badge>
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

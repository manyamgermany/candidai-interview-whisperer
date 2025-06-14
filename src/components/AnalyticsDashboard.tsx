import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Mic,
  Target,
  Award,
  Users,
  Brain,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { chromeStorage, SessionData } from '@/utils/chromeStorage';
import { AnalyticsDataProcessor, ProcessedAnalytics } from '@/utils/analyticsDataProcessor';
import { smartDefaultsService } from '@/services/smartDefaultsService';
import { useToast } from "@/hooks/use-toast";

interface AnalyticsDashboardProps {
  onNavigate: (tab: string) => void;
}

const AnalyticsDashboard = ({ onNavigate }: AnalyticsDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [analytics, setAnalytics] = useState<ProcessedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load session data from Chrome storage
      const sessions = await chromeStorage.getSessionHistory();
      setSessionData(sessions);
      
      // Process the data for analytics
      const processedData = AnalyticsDataProcessor.processSessionData(sessions, selectedPeriod);
      setAnalytics(processedData);
      
      // Initialize smart defaults service with session data
      await smartDefaultsService.initialize();
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load session data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    if (!analytics) return;
    
    try {
      const reportData = {
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        summary: analytics.sessionMetrics,
        sessions: analytics.recentSessions,
        performance: analytics.performanceData
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidai-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Exported",
        description: "Analytics report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report.",
        variant: "destructive",
      });
    }
  };

  // Generate AI insights based on real data
  const generateAIInsights = () => {
    if (!analytics || analytics.recentSessions.length === 0) {
      return [
        {
          type: 'info',
          title: 'Start Practicing',
          description: 'Complete some interview sessions to see personalized insights here.',
          icon: <Brain className="h-4 w-4" />
        }
      ];
    }

    const insights = [];
    const recommendations = smartDefaultsService.getRecommendations();
    
    // Add insights based on real data patterns
    const avgConfidence = analytics.sessionMetrics.find(m => m.metric === 'Confidence Score');
    if (avgConfidence) {
      const confidenceValue = parseInt(avgConfidence.value);
      if (confidenceValue >= 85) {
        insights.push({
          type: 'strength',
          title: 'Strong Confidence',
          description: `Your average confidence score of ${confidenceValue}% is excellent`,
          icon: <TrendingUp className="h-4 w-4" />
        });
      } else if (confidenceValue < 70) {
        insights.push({
          type: 'improvement',
          title: 'Building Confidence',
          description: `Focus on practice to improve your ${confidenceValue}% confidence score`,
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    }

    // Add smart defaults recommendations
    recommendations.forEach(rec => {
      insights.push({
        type: rec.type,
        title: rec.title,
        description: rec.description,
        icon: <Brain className="h-4 w-4" />
      });
    });

    return insights.slice(0, 4); // Limit to 4 insights
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-pink-600" />
          <span className="text-lg text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const aiInsights = generateAIInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate("dashboard")}
                className="text-gray-600 hover:text-pink-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Performance Analytics</h1>
                  <p className="text-xs text-gray-500">
                    {sessionData.length > 0 ? `${sessionData.length} sessions analyzed` : 'No session data yet'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border border-pink-200 rounded-md px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button 
                variant="outline" 
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
                onClick={exportReport}
                disabled={!analytics}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAnalyticsData}
                className="text-gray-600 hover:text-pink-600"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessionData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Session Data Yet</h3>
            <p className="text-gray-600 mb-6">Start practicing interviews to see your analytics here.</p>
            <Button onClick={() => onNavigate("dashboard")} className="bg-pink-600 hover:bg-pink-700">
              Start Your First Session
            </Button>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {analytics?.sessionMetrics.map((metric, index) => (
                <Card key={index} className="border-pink-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{metric.metric}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{metric.change}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-pink-50 border-pink-200">
                <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Performance Trends
                </TabsTrigger>
                <TabsTrigger value="sessions" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Session Details
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Comparisons
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                {/* Performance Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-pink-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-pink-600" />
                        <span>Confidence Score Trend</span>
                      </CardTitle>
                      <CardDescription>
                        Track your interview confidence over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.performanceData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #fbb6ce',
                              borderRadius: '8px' 
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="confidence" 
                            stroke="#ec4899" 
                            strokeWidth={3}
                            dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mic className="h-5 w-5 text-pink-600" />
                        <span>Speaking Metrics</span>
                      </CardTitle>
                      <CardDescription>
                        Words per minute and filler word analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.performanceData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #fbb6ce',
                              borderRadius: '8px' 
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="wpm" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Words per Minute"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="fillerWords" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            name="Filler Words"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Interview Types Distribution */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-pink-600" />
                      <span>Interview Types Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Breakdown of your interview practice sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics?.interviewTypeData || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {(analytics?.interviewTypeData || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-4">
                        {(analytics?.interviewTypeData || []).map((type, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: type.color }}
                              ></div>
                              <span className="text-sm font-medium">{type.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{type.value}%</span>
                              <div className="text-xs text-gray-500">
                                {Math.round(sessionData.length * (type.value / 100))} sessions
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-pink-600" />
                      <span>Recent Sessions</span>
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of your latest interview sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analytics?.recentSessions || []).map((session) => (
                        <div key={session.id} className="border border-pink-100 rounded-lg p-4 hover:bg-pink-25 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                                <Target className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{session.type}</h4>
                                <p className="text-sm text-gray-500">{session.date} • {session.duration}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`${
                                session.score === 'Excellent' 
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : session.score === 'Very Good'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              {session.score}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-pink-600">{session.confidence}%</div>
                              <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{session.wpm}</div>
                              <div className="text-xs text-gray-500">WPM</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{session.fillerWords}</div>
                              <div className="text-xs text-gray-500">Filler Words</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <Brain className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                            <span>{session.feedback}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {aiInsights.map((insight, index) => (
                    <Card key={index} className="border-pink-100">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            insight.type === 'strength' ? 'bg-green-100 text-green-600' :
                            insight.type === 'improvement' ? 'bg-orange-100 text-orange-600' :
                            insight.type === 'achievement' ? 'bg-blue-100 text-blue-600' :
                            'bg-pink-100 text-pink-600'
                          }`}>
                            {insight.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* AI Coaching Recommendations */}
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-pink-600" />
                      <span>Personalized Coaching Plan</span>
                    </CardTitle>
                    <CardDescription>
                      AI-generated recommendations based on your performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg">
                        <h4 className="font-medium text-pink-900 mb-2">Week 1-2: Foundation Building</h4>
                        <ul className="space-y-1 text-sm text-pink-800">
                          <li>• Practice STAR method with 5 behavioral questions daily</li>
                          <li>• Focus on reducing filler words through mindful speaking</li>
                          <li>• Record practice sessions to track progress</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Week 3-4: Advanced Techniques</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• Practice system design questions with structured approach</li>
                          <li>• Work on speaking pace optimization (target 140-145 WPM)</li>
                          <li>• Mock interviews with increasing complexity</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-pink-600" />
                      <span>Benchmark Comparison</span>
                    </CardTitle>
                    <CardDescription>
                      See how you compare to other professionals in your field
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Confidence Score</span>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-pink-600 font-medium">You: 89%</span>
                            <span className="text-gray-500">Industry Avg: 76%</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={89} className="h-3" />
                          <div className="absolute top-0 left-[76%] w-0.5 h-3 bg-gray-400"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>Industry Average</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Speaking Pace (WPM)</span>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-pink-600 font-medium">You: 145</span>
                            <span className="text-gray-500">Optimal: 120-150</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={96} className="h-3" />
                          <div className="absolute top-0 left-[80%] w-1 h-3 bg-green-400 rounded"></div>
                          <div className="absolute top-0 left-[100%] w-1 h-3 bg-green-400 rounded"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>80 WPM</span>
                          <span>Optimal Range</span>
                          <span>200 WPM</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Filler Word Usage</span>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-pink-600 font-medium">You: 3/min</span>
                            <span className="text-gray-500">Good: &lt;5/min</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={20} className="h-3" />
                          <div className="absolute top-0 left-[33%] w-0.5 h-3 bg-green-400"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0/min</span>
                          <span>Good Threshold</span>
                          <span>15/min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Users, Target, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerformanceReport } from "@/types/interviewTypes";
import { SessionHistory } from "./SessionHistory";
import { RecentSessions } from "./RecentSessions";

interface PerformanceReportsProps {
  latestReport?: PerformanceReport | null;
}

export const PerformanceReports = ({ latestReport }: PerformanceReportsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleExportReport = () => {
    if (latestReport) {
      const dataStr = JSON.stringify(latestReport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      toast({
        title: "No Report Available",
        description: "Complete a session first to generate a performance report.",
        variant: "destructive",
      });
    }
  };

  const mockMetrics = {
    averageScore: 87,
    totalSessions: 15,
    improvementRate: 12,
    weeklyGoal: 20
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-600">Track your progress and analyze your performance</p>
        </div>
        <Button 
          variant="outline" 
          className="border-pink-200 text-pink-700 hover:bg-pink-50"
          onClick={handleExportReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-pink-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{mockMetrics.averageScore}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalSessions}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Improvement</p>
                    <p className="text-2xl font-bold text-gray-900">+{mockMetrics.improvementRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                    <p className="text-2xl font-bold text-gray-900">{mockMetrics.weeklyGoal}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Report */}
          {latestReport && (
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-pink-600" />
                  <span>Latest Performance Report</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    New
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Generated on {new Date(latestReport.timestamp).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overall Score</p>
                    <p className="text-2xl font-bold text-gray-900">{latestReport.metrics.overallScore}%</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Communication</p>
                    <p className="text-2xl font-bold text-blue-600">{latestReport.metrics.communicationScore}%</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Technical</p>
                    <p className="text-2xl font-bold text-green-600">{latestReport.metrics.technicalScore}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Improvements</h4>
                  <ul className="space-y-1">
                    {latestReport.recommendations.slice(0, 3).map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-600">• {recommendation}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <SessionHistory />
        </TabsContent>

        <TabsContent value="recent">
          <RecentSessions />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-pink-600" />
                <span>Detailed Analytics</span>
              </CardTitle>
              <CardDescription>
                Advanced performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Detailed analytics and trends will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

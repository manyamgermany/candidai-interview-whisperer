
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Clock, Activity, AlertCircle } from "lucide-react";

interface UsageMonitorProps {
  settings: any;
}

export const UsageMonitor = ({ settings }: UsageMonitorProps) => {
  const [usageData, setUsageData] = useState({
    openai: { requests: 245, cost: 12.35, avgResponseTime: 850, quota: 1000 },
    claude: { requests: 89, cost: 8.90, avgResponseTime: 1200, quota: 500 },
    gemini: { requests: 156, cost: 4.20, avgResponseTime: 950, quota: 750 }
  });

  const [performanceData, setPerformanceData] = useState({
    totalRequests: 490,
    totalCost: 25.45,
    avgResponseTime: 950,
    successRate: 96.8
  });

  const providers = [
    { id: "openai", name: "OpenAI", color: "bg-green-500" },
    { id: "claude", name: "Claude", color: "bg-blue-500" },
    { id: "gemini", name: "Gemini", color: "bg-purple-500" }
  ];

  const getUsagePercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cost);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Requests</span>
            </div>
            <div className="text-2xl font-bold">{performanceData.totalRequests}</div>
            <div className="text-xs text-gray-500">This month</div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <div className="text-2xl font-bold">{formatCost(performanceData.totalCost)}</div>
            <div className="text-xs text-gray-500">This month</div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <div className="text-2xl font-bold">{performanceData.avgResponseTime}ms</div>
            <div className="text-xs text-gray-500">Last 24h</div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">{performanceData.successRate}%</div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Usage */}
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Provider Usage & Quotas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => {
            const usage = usageData[provider.id as keyof typeof usageData];
            const percentage = getUsagePercentage(usage.requests, usage.quota);
            
            return (
              <div key={provider.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                    <span className="font-medium">{provider.name}</span>
                    {percentage >= 90 && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={getUsageColor(percentage)}>
                      {usage.requests}/{usage.quota} requests
                    </span>
                    <Badge variant="secondary">
                      {formatCost(usage.cost)}
                    </Badge>
                    <Badge variant="outline">
                      {usage.avgResponseTime}ms
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    '--progress-foreground': percentage >= 90 ? 'rgb(239 68 68)' : 
                                           percentage >= 70 ? 'rgb(245 158 11)' : 
                                           'rgb(34 197 94)'
                  } as React.CSSProperties}
                />
                {percentage >= 90 && (
                  <div className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Approaching quota limit</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average cost per request</span>
              <span className="font-medium">{formatCost(performanceData.totalCost / performanceData.totalRequests)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Projected monthly cost</span>
              <span className="font-medium">{formatCost(performanceData.totalCost * 2.1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Most cost-effective provider</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Gemini
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

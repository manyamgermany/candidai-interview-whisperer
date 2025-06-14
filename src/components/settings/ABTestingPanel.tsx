
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, Play, Pause, BarChart3, TrendingUp, Copy } from "lucide-react";

interface ABTestingPanelProps {
  settings: any;
  onApplyConfiguration: (config: any) => void;
}

export const ABTestingPanel = ({ settings, onApplyConfiguration }: ABTestingPanelProps) => {
  const { toast } = useToast();
  const [activeTests, setActiveTests] = useState([
    {
      id: 1,
      name: "Response Length Optimization",
      status: "active",
      progress: 65,
      configA: { responseStyle: { length: "medium" } },
      configB: { responseStyle: { length: "brief" } },
      metrics: {
        configA: { responseTime: 1200, userSatisfaction: 8.2, accuracy: 94 },
        configB: { responseTime: 800, userSatisfaction: 7.8, accuracy: 91 }
      }
    },
    {
      id: 2,
      name: "AI Provider Performance",
      status: "completed",
      progress: 100,
      configA: { aiProvider: { primary: "openai" } },
      configB: { aiProvider: { primary: "claude" } },
      metrics: {
        configA: { responseTime: 950, userSatisfaction: 8.5, accuracy: 96 },
        configB: { responseTime: 1100, userSatisfaction: 8.3, accuracy: 94 }
      }
    }
  ]);

  const [availableTests] = useState([
    {
      name: "Tone Comparison",
      description: "Test professional vs conversational tone",
      configA: { responseStyle: { tone: "professional" } },
      configB: { responseStyle: { tone: "conversational" } }
    },
    {
      name: "Coaching Frequency",
      description: "Compare real-time vs batch coaching",
      configA: { coaching: { enableRealtime: true } },
      configB: { coaching: { enableRealtime: false } }
    },
    {
      name: "Audio Processing",
      description: "Test different noise reduction settings",
      configA: { audio: { noiseReduction: true } },
      configB: { audio: { noiseReduction: false } }
    }
  ]);

  const startTest = (testConfig: any) => {
    const newTest = {
      id: Date.now(),
      name: testConfig.name,
      status: "active",
      progress: 0,
      configA: testConfig.configA,
      configB: testConfig.configB,
      metrics: {
        configA: { responseTime: 0, userSatisfaction: 0, accuracy: 0 },
        configB: { responseTime: 0, userSatisfaction: 0, accuracy: 0 }
      }
    };

    setActiveTests(prev => [...prev, newTest]);
    
    toast({
      title: "A/B Test Started",
      description: `${testConfig.name} is now running`,
    });
  };

  const pauseTest = (testId: number) => {
    setActiveTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: "paused" } : test
    ));
  };

  const resumeTest = (testId: number) => {
    setActiveTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: "active" } : test
    ));
  };

  const applyWinningConfig = (test: any, winner: 'A' | 'B') => {
    const config = winner === 'A' ? test.configA : test.configB;
    onApplyConfiguration(config);
    
    toast({
      title: "Configuration Applied",
      description: `Applied winning configuration from ${test.name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "paused": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getWinner = (test: any) => {
    const { configA, configB } = test.metrics;
    const scoreA = (configA.userSatisfaction + configA.accuracy) / 2;
    const scoreB = (configB.userSatisfaction + configB.accuracy) / 2;
    
    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'Tie';
  };

  return (
    <div className="space-y-6">
      {/* Active Tests */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            <span>A/B Tests</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {activeTests.filter(t => t.status === 'active').length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTests.map((test) => (
            <div key={test.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{test.name}</span>
                  <Badge variant="secondary" className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                  {test.status === "completed" && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Winner: Config {getWinner(test)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {test.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pauseTest(test.id)}
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {test.status === "paused" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resumeTest(test.id)}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}
                  {test.status === "completed" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyWinningConfig(test, 'A')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        Apply A
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyWinningConfig(test, 'B')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        Apply B
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {test.status !== "completed" && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{test.progress}%</span>
                  </div>
                  <Progress value={test.progress} className="h-2" />
                </div>
              )}

              {test.status === "completed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border rounded">
                    <h4 className="font-medium mb-2">Configuration A</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{test.metrics.configA.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfaction:</span>
                        <span>{test.metrics.configA.userSatisfaction}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span>{test.metrics.configA.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border rounded">
                    <h4 className="font-medium mb-2">Configuration B</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{test.metrics.configB.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfaction:</span>
                        <span>{test.metrics.configB.userSatisfaction}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span>{test.metrics.configB.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Available Tests */}
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Start New Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableTests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{test.name}</div>
                <div className="text-sm text-gray-500">{test.description}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startTest(test)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <FlaskConical className="h-3 w-3 mr-1" />
                Start Test
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

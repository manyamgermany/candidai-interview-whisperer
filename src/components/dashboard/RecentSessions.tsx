
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target } from "lucide-react";

export const RecentSessions = () => {
  const recentSessions = [
    { id: 1, type: "Technical Meeting", duration: "45:23", score: 89, date: "2024-06-13" },
    { id: 2, type: "Team Meeting", duration: "32:15", score: 92, date: "2024-06-12" },
    { id: 3, type: "Sales Call", duration: "38:47", score: 85, date: "2024-06-11" }
  ];

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-pink-600" />
          <span>Recent Sessions</span>
        </CardTitle>
        <CardDescription>
          Your latest meeting performance history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{session.type}</p>
                  <p className="text-xs text-gray-500">{session.date} • {session.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {session.score}%
                </Badge>
                <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                  View Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

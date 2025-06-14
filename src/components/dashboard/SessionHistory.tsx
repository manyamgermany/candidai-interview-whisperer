
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, BarChart3, Search, Filter, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/services/storageService";
import { SessionData } from "@/types/storageTypes";

export const SessionHistory = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "practice" | "real" | "simulation">("all");
  const [sortBy, setSortBy] = useState<"date" | "duration" | "score">("date");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterAndSortSessions();
  }, [sessions, searchTerm, filterType, sortBy]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionData = await storageService.getAllSessions();
      setSessions(sessionData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load session history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSessions = () => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(session => session.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.date - a.date;
        case "duration":
          return b.duration - a.duration;
        case "score":
          return b.performance.score - a.performance.score;
        default:
          return 0;
      }
    });

    setFilteredSessions(filtered);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await storageService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Session Deleted",
        description: "Session has been removed from history.",
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete session.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'practice': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'real': return 'bg-green-100 text-green-700 border-green-200';
      case 'simulation': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-pink-600" />
            <span>Session History</span>
          </CardTitle>
          <CardDescription>Loading your interview session history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading sessions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
          <p className="text-gray-600">Review your past interview sessions and performance</p>
        </div>
        <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-pink-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="real">Real Interview</SelectItem>
                <SelectItem value="simulation">Simulation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{filteredSessions.length} sessions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your filters or search terms" 
                : "Start your first interview session to see history here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="border-gray-200 hover:border-pink-200 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getTypeColor(session.type)}>
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(session.date)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-sm font-medium">Performance Score:</span>
                        <span className={`font-bold ${getScoreColor(session.performance.score)}`}>
                          {session.performance.score}%
                        </span>
                      </div>
                      <Progress value={session.performance.score} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Words per minute:</span>
                        <span className="ml-2">{session.analytics.wordsPerMinute}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total words:</span>
                        <span className="ml-2">{session.analytics.totalWords}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Confidence:</span>
                        <span className="ml-2">{Math.round(session.analytics.confidenceScore)}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Filler words:</span>
                        <span className="ml-2">{session.analytics.fillerWords}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

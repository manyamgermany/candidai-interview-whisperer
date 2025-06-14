
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";
import { VirtualizedSessionList } from "./VirtualizedSessionList";
import { useAppStore } from "@/store/useAppStore";
import { storageService } from "@/services/storageService";
import { SessionData } from "@/types/storageTypes";

export const SessionHistory = () => {
  const { sessions, loadSessions, removeSession, setLoading, loading, setError } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "practice" | "real" | "simulation">("all");
  const [sortBy, setSortBy] = useState<"date" | "duration" | "score">("date");
  const { toast } = useToast();

  const isLoading = loading['sessions'] || false;

  useEffect(() => {
    loadSessionsData();
  }, []);

  const loadSessionsData = useCallback(async () => {
    try {
      setLoading('sessions', true);
      setError('sessions', null);
      const sessionData = await storageService.getAllSessions();
      loadSessions(sessionData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('sessions', 'Failed to load session history');
      toast({
        title: "Loading Error",
        description: "Failed to load session history.",
        variant: "destructive",
      });
    } finally {
      setLoading('sessions', false);
    }
  }, [loadSessions, setLoading, setError, toast]);

  const filteredSessions = useMemo(() => {
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

    return filtered;
  }, [sessions, searchTerm, filterType, sortBy]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      await storageService.deleteSession(sessionId);
      removeSession(sessionId);
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
  }, [removeSession, toast]);

  const handleViewSession = useCallback((sessionId: string) => {
    // Implementation for viewing session details
    console.log('Viewing session:', sessionId);
  }, []);

  const handleExportData = useCallback(() => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidai-sessions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

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
    <ComponentErrorBoundary componentName="SessionHistory">
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
            <p className="text-gray-600">Review your past interview sessions and performance</p>
          </div>
          <Button 
            variant="outline" 
            className="border-pink-200 text-pink-700 hover:bg-pink-50"
            onClick={handleExportData}
          >
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
          <Card className="border-pink-100">
            <CardContent className="pt-6">
              <VirtualizedSessionList
                sessions={filteredSessions}
                onDeleteSession={handleDeleteSession}
                onViewSession={handleViewSession}
                height={600}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ComponentErrorBoundary>
  );
};

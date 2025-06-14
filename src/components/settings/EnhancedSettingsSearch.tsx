
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Clock } from "lucide-react";

interface EnhancedSettingsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (section: string, subsection?: string) => void;
}

export const EnhancedSettingsSearch = ({ searchQuery, onSearchChange, onNavigate }: EnhancedSettingsSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "api keys", "response style", "audio settings"
  ]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const searchableContent = [
    // AI Provider Section
    { title: "OpenAI API Key", section: "providers", subsection: "openai", keywords: ["openai", "gpt", "api", "key"] },
    { title: "Claude API Key", section: "providers", subsection: "claude", keywords: ["claude", "anthropic", "api", "key"] },
    { title: "Gemini API Key", section: "providers", subsection: "gemini", keywords: ["gemini", "google", "api", "key"] },
    { title: "Model Selection", section: "providers", subsection: "models", keywords: ["model", "gpt-4", "claude-3", "gemini-pro"] },
    { title: "Connection Testing", section: "providers", subsection: "test", keywords: ["test", "connection", "verify", "status"] },
    
    // Response Configuration
    { title: "Response Tone", section: "response", subsection: "tone", keywords: ["tone", "professional", "conversational", "friendly"] },
    { title: "Response Length", section: "response", subsection: "length", keywords: ["length", "brief", "medium", "detailed", "comprehensive"] },
    { title: "Response Preview", section: "response", subsection: "preview", keywords: ["preview", "example", "sample"] },
    
    // Audio Settings
    { title: "Microphone Settings", section: "audio", subsection: "input", keywords: ["microphone", "input", "device", "audio"] },
    { title: "Speaker Settings", section: "audio", subsection: "output", keywords: ["speaker", "output", "device", "audio"] },
    { title: "Noise Reduction", section: "audio", subsection: "noise", keywords: ["noise", "reduction", "filter"] },
    { title: "Speech Analysis", section: "audio", subsection: "analysis", keywords: ["speech", "analysis", "filler", "words"] },
    
    // Privacy
    { title: "Data Privacy", section: "privacy", subsection: "data", keywords: ["privacy", "data", "security", "tracking"] },
    { title: "Analytics", section: "privacy", subsection: "analytics", keywords: ["analytics", "tracking", "metrics"] },
    { title: "Local Processing", section: "privacy", subsection: "local", keywords: ["local", "processing", "offline"] },
    
    // Advanced Features
    { title: "Bulk Actions", section: "advanced", subsection: "bulk", keywords: ["bulk", "batch", "test", "all"] },
    { title: "Usage Monitoring", section: "advanced", subsection: "usage", keywords: ["usage", "cost", "monitoring", "analytics"] },
    { title: "Backup Management", section: "advanced", subsection: "backup", keywords: ["backup", "export", "import", "restore"] },
    { title: "A/B Testing", section: "advanced", subsection: "testing", keywords: ["ab", "test", "experiment", "compare"] },
    { title: "Settings Validation", section: "advanced", subsection: "validation", keywords: ["validation", "errors", "conflicts", "issues"] }
  ];

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = searchableContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    onSearchChange(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    onNavigate(suggestion.section, suggestion.subsection);
    setIsOpen(false);
    onSearchChange("");
    
    if (!recentSearches.includes(suggestion.title)) {
      setRecentSearches(prev => [suggestion.title, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    onSearchChange("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-80">
      <div className="relative">
        <Input
          placeholder="Search settings, features, or help..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2">
                  Search Results
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{suggestion.title}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {suggestion.section.replace(/([A-Z])/g, ' $1')}
                          {suggestion.subsection && ` • ${suggestion.subsection}`}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.section}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No settings found for "{searchQuery}"
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {search}
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

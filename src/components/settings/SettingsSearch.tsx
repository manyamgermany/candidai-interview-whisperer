
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X } from "lucide-react";

interface SettingsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: string) => void;
}

export const SettingsSearch = ({ searchQuery, onSearchChange, onTabChange }: SettingsSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const searchableItems = [
    { title: "API Keys", tab: "providers", keywords: ["api", "key", "openai", "claude", "gemini", "authentication"] },
    { title: "Model Selection", tab: "providers", keywords: ["model", "gpt", "claude", "gemini", "llm"] },
    { title: "Connection Testing", tab: "providers", keywords: ["test", "connection", "connectivity", "status"] },
    { title: "Response Style", tab: "response", keywords: ["style", "tone", "professional", "conversational"] },
    { title: "Response Length", tab: "response", keywords: ["length", "brief", "detailed", "comprehensive"] },
    { title: "Audio Settings", tab: "audio", keywords: ["audio", "microphone", "speech", "voice"] },
    { title: "Speech Analysis", tab: "audio", keywords: ["filler", "confidence", "analysis", "feedback"] },
    { title: "Privacy Controls", tab: "privacy", keywords: ["privacy", "data", "tracking", "analytics"] },
    { title: "Local Processing", tab: "privacy", keywords: ["local", "processing", "security"] }
  ];

  const filteredItems = searchableItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleItemClick = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
    onSearchChange("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-64 pl-10 pr-10"
            aria-label="Search settings"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-64 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Settings</h4>
              {filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.tab)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.tab.replace(/([A-Z])/g, ' $1')}</div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No settings found for "{searchQuery}"
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              Type to search settings...
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

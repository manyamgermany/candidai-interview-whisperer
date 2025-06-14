import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, BarChart3, Settings, Mic, Users, Download, Chrome } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import DocumentProcessor from "@/components/DocumentProcessor";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SettingsPanel from "@/components/SettingsPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Meeting Assistance",
      description: "Multi-LLM support with OpenAI GPT, Anthropic Claude, and Google Gemini integration for real-time suggestions.",
      highlights: ["Real-time Suggestions", "Multi-LLM Support", "Intelligent Fallback"]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Processing & Analysis",
      description: "Advanced resume analysis with PDF and DOCX parsing, skills extraction, and intelligent insights.",
      highlights: ["Resume Analysis", "Multi-format Support", "Skills Extraction"]
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Comprehensive speech analysis with WPM tracking, filler word detection, and confidence scoring.",
      highlights: ["Speech Analysis", "Performance Metrics", "Historical Tracking"]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Meeting Coaching Framework",
      description: "Structured response frameworks including STAR, SOAR, and PREP methods with adaptive coaching.",
      highlights: ["STAR Framework", "Coaching Templates", "Practice System"]
    }
  ];

  const stats = [
    { label: "Success Rate", value: "94%", description: "Meeting success improvement" },
    { label: "AI Models", value: "3", description: "Integrated LLM providers" },
    { label: "Frameworks", value: "5+", description: "Response methodologies" },
    { label: "Platforms", value: "10+", description: "Supported meeting platforms" }
  ];

  if (activeTab === "dashboard") {
    return <Dashboard onNavigate={setActiveTab} />;
  }

  if (activeTab === "documents") {
    return <DocumentProcessor onNavigate={setActiveTab} />;
  }

  if (activeTab === "analytics") {
    return <AnalyticsDashboard onNavigate={setActiveTab} />;
  }

  if (activeTab === "settings") {
    return <SettingsPanel onNavigate={setActiveTab} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Chrome className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  CandidAI
                </h1>
                <p className="text-xs text-gray-500">Professional Meeting Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab("dashboard")}
                className="text-gray-600 hover:text-pink-600"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => setActiveTab("dashboard")}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-pink-100 text-pink-700 border-pink-200">
            Chrome Extension
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Advanced
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"> AI Meeting </span>
            Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional meeting assistant with real-time transcription, AI-powered suggestions, 
            performance analytics, and comprehensive reporting capabilities.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => setActiveTab("dashboard")}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3"
            >
              Launch Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setActiveTab("documents")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Try Document Analysis
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-pink-600 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Meeting
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"> Intelligence </span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in professional meetings with advanced AI assistance and analytics.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-lg group">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600 group-hover:from-pink-200 group-hover:to-rose-200 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200 text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Meeting Experience?</h3>
          <p className="text-xl mb-8 text-pink-100">
            Join thousands of professionals who have improved their meeting success rate with CandidAI.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setActiveTab("dashboard")}
              className="bg-white text-pink-600 hover:bg-gray-50 px-8 py-3"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Launch Application
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setActiveTab("analytics")}
              className="border-white text-white hover:bg-white/10 px-8 py-3"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Chrome className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">CandidAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional meeting assistant powered by advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AI Meeting Assistance</li>
                <li>Document Processing</li>
                <li>Performance Analytics</li>
                <li>Professional Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platforms</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Google Meet</li>
                <li>Microsoft Teams</li>
                <li>Zoom</li>
                <li>LinkedIn</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">AI Providers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>OpenAI GPT</li>
                <li>Anthropic Claude</li>
                <li>Google Gemini</li>
                <li>Intelligent Fallback</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CandidAI. Professional Meeting Assistant Chrome Extension.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

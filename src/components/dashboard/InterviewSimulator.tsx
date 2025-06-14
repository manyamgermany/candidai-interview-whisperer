
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Target, Clock, Mic } from "lucide-react";
import { InterviewType, IndustryType } from "@/types/interviewTypes";
import { personalizedResponseService } from "@/services/personalizedResponseService";

interface SimulationQuestion {
  id: number;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  framework: string;
}

export const InterviewSimulator = () => {
  const [selectedInterviewType, setSelectedInterviewType] = useState<InterviewType>('behavioral');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general');
  const [simulationActive, setSimulationActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
  const [isRecording, setIsRecording] = useState(false);

  const questions: Record<InterviewType, SimulationQuestion[]> = {
    behavioral: [
      {
        id: 1,
        question: "Tell me about a time when you had to overcome a significant challenge at work.",
        type: 'behavioral',
        difficulty: 'medium',
        framework: 'STAR'
      },
      {
        id: 2,
        question: "Describe a situation where you had to work with a difficult team member.",
        type: 'behavioral',
        difficulty: 'medium',
        framework: 'STAR'
      },
      {
        id: 3,
        question: "Give me an example of when you had to make a decision with incomplete information.",
        type: 'behavioral',
        difficulty: 'hard',
        framework: 'STAR'
      }
    ],
    technical: [
      {
        id: 1,
        question: "Explain how you would design a scalable system for handling user authentication.",
        type: 'technical',
        difficulty: 'hard',
        framework: 'Problem-Solution-Trade-offs'
      },
      {
        id: 2,
        question: "Walk me through your approach to debugging a performance issue in production.",
        type: 'technical',
        difficulty: 'medium',
        framework: 'Systematic Approach'
      },
      {
        id: 3,
        question: "How would you implement a caching strategy for a high-traffic web application?",
        type: 'technical',
        difficulty: 'hard',
        framework: 'Requirements-Design-Implementation'
      }
    ],
    managerial: [
      {
        id: 1,
        question: "How do you handle underperforming team members?",
        type: 'behavioral',
        difficulty: 'medium',
        framework: 'Situation-Action-Result'
      },
      {
        id: 2,
        question: "Describe your approach to setting and communicating team goals.",
        type: 'behavioral',
        difficulty: 'medium',
        framework: 'Strategy-Implementation-Measurement'
      },
      {
        id: 3,
        question: "Tell me about a time you had to make a difficult decision that affected your team.",
        type: 'behavioral',
        difficulty: 'hard',
        framework: 'STAR'
      }
    ],
    executive: [
      {
        id: 1,
        question: "How would you drive organizational transformation in a traditional company?",
        type: 'situational',
        difficulty: 'hard',
        framework: 'Vision-Strategy-Execution'
      },
      {
        id: 2,
        question: "Describe your approach to managing stakeholder expectations during a crisis.",
        type: 'behavioral',
        difficulty: 'hard',
        framework: 'Leadership Framework'
      }
    ],
    'sales-pitch': [
      {
        id: 1,
        question: "You have 5 minutes to convince me to buy your product. Go.",
        type: 'situational',
        difficulty: 'medium',
        framework: 'Problem-Solution-Value'
      },
      {
        id: 2,
        question: "How would you handle a client's objection about pricing?",
        type: 'situational',
        difficulty: 'medium',
        framework: 'Listen-Understand-Respond'
      }
    ],
    'client-meeting': [
      {
        id: 1,
        question: "A client is unhappy with project delays. How do you address this?",
        type: 'situational',
        difficulty: 'medium',
        framework: 'Acknowledge-Analyze-Action'
      }
    ],
    'vendor-meeting': [
      {
        id: 1,
        question: "Negotiate the terms for a critical vendor contract under tight deadlines.",
        type: 'situational',
        difficulty: 'medium',
        framework: 'Preparation-Negotiation-Agreement'
      }
    ],
    'board-meeting': [
      {
        id: 1,
        question: "Present the quarterly results and strategic recommendations to the board.",
        type: 'situational',
        difficulty: 'hard',
        framework: 'Data-Insights-Recommendations'
      }
    ],
    'team-meeting': [
      {
        id: 1,
        question: "Lead a team discussion about changing project priorities.",
        type: 'situational',
        difficulty: 'medium',
        framework: 'Context-Discussion-Decision'
      }
    ],
    'performance-review': [
      {
        id: 1,
        question: "Discuss your achievements and areas for improvement this year.",
        type: 'behavioral',
        difficulty: 'medium',
        framework: 'Achievements-Growth-Goals'
      }
    ],
    general: [
      {
        id: 1,
        question: "Tell me about yourself and why you're interested in this opportunity.",
        type: 'behavioral',
        difficulty: 'easy',
        framework: 'Background-Skills-Motivation'
      },
      {
        id: 2,
        question: "What are your greatest strengths and how do they apply to this role?",
        type: 'behavioral',
        difficulty: 'easy',
        framework: 'Strength-Evidence-Application'
      }
    ]
  };

  const currentQuestions = questions[selectedInterviewType] || questions.general;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const startSimulation = () => {
    setSimulationActive(true);
    setCurrentQuestionIndex(0);
    setTimeRemaining(120);
    
    // Update user profile with selected interview type and industry
    const userProfile = personalizedResponseService.getUserProfile();
    if (userProfile) {
      personalizedResponseService.updateInterviewType(selectedInterviewType);
      personalizedResponseService.updateTargetIndustry(selectedIndustry);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(120);
      setIsRecording(false);
    } else {
      // End simulation
      setSimulationActive(false);
      setIsRecording(false);
    }
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(120);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600">
              <Target className="h-5 w-5" />
            </div>
            <span>Interview Simulator</span>
            {simulationActive && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                Active Session
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Practice with personalized interview questions tailored to your profile and target role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!simulationActive ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Type</label>
                  <Select value={selectedInterviewType} onValueChange={(value) => setSelectedInterviewType(value as InterviewType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                      <SelectItem value="technical">Technical Interview</SelectItem>
                      <SelectItem value="managerial">Managerial Interview</SelectItem>
                      <SelectItem value="executive">Executive Interview</SelectItem>
                      <SelectItem value="sales-pitch">Sales Pitch</SelectItem>
                      <SelectItem value="client-meeting">Client Meeting</SelectItem>
                      <SelectItem value="vendor-meeting">Vendor Meeting</SelectItem>
                      <SelectItem value="board-meeting">Board Meeting</SelectItem>
                      <SelectItem value="team-meeting">Team Meeting</SelectItem>
                      <SelectItem value="performance-review">Performance Review</SelectItem>
                      <SelectItem value="general">General Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry Focus</label>
                  <Select value={selectedIndustry} onValueChange={(value) => setSelectedIndustry(value as IndustryType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="product">Product Management</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Simulation Features:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Personalized Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time AI Coaching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Performance Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Framework Guidance</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={startSimulation}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview Simulation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.framework}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-4">Interview Question:</h3>
                  <p className="text-gray-800 text-lg leading-relaxed">{currentQuestion.question}</p>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
                  </Button>
                  
                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex >= currentQuestions.length - 1}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {currentQuestionIndex >= currentQuestions.length - 1 ? "Finish" : "Next Question"}
                  </Button>
                </div>

                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              </div>

              {isRecording && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-800 font-medium">Recording your response...</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      AI Coach is analyzing your response and will provide real-time suggestions.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

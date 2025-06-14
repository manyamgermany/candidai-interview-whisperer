
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Zap, Shield } from "lucide-react";

interface SetupWizardProps {
  onComplete: (settings: any) => void;
  onSkip: () => void;
}

export const SetupWizard = ({ onComplete, onSkip }: SetupWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardSettings, setWizardSettings] = useState({
    useCase: '',
    provider: '',
    apiKey: '',
    experience: '',
    privacy: 'balanced'
  });

  const steps = [
    { title: "Welcome", description: "Let's get you set up" },
    { title: "Use Case", description: "What will you use CandidAI for?" },
    { title: "AI Provider", description: "Choose your preferred AI service" },
    { title: "Experience Level", description: "Help us customize for you" },
    { title: "Privacy Preferences", description: "Set your comfort level" },
    { title: "Complete", description: "You're all set!" }
  ];

  const useCases = [
    { id: 'interviews', name: 'Job Interviews', icon: '💼', description: 'Practice and get feedback on interview responses' },
    { id: 'presentations', name: 'Presentations', icon: '📊', description: 'Improve public speaking and presentation skills' },
    { id: 'meetings', name: 'Meetings', icon: '🤝', description: 'Better communication in professional meetings' },
    { id: 'general', name: 'General Speaking', icon: '🗣️', description: 'Overall communication improvement' }
  ];

  const providers = [
    { id: 'openai', name: 'OpenAI', icon: '🤖', description: 'Most reliable, great for beginners', recommended: true },
    { id: 'claude', name: 'Claude', icon: '🧠', description: 'Excellent analysis, more detailed feedback' },
    { id: 'gemini', name: 'Gemini', icon: '✨', description: 'Good balance of speed and quality' }
  ];

  const experienceLevels = [
    { id: 'beginner', name: 'Beginner', description: 'New to AI-powered coaching' },
    { id: 'intermediate', name: 'Intermediate', description: 'Some experience with similar tools' },
    { id: 'advanced', name: 'Advanced', description: 'Power user who wants full control' }
  ];

  const privacyLevels = [
    { id: 'strict', name: 'Maximum Privacy', description: 'Local processing only, no analytics' },
    { id: 'balanced', name: 'Balanced', description: 'Some analytics for improvement' },
    { id: 'open', name: 'Full Features', description: 'All features enabled for best experience' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = () => {
    const settings = generateSettings();
    onComplete(settings);
    toast({
      title: "Setup Complete!",
      description: "Your personalized settings have been applied.",
    });
  };

  const generateSettings = () => {
    const baseSettings = {
      aiProvider: {
        primary: wizardSettings.provider,
        [`${wizardSettings.provider}Key`]: wizardSettings.apiKey,
        models: {
          [wizardSettings.provider]: getRecommendedModel(wizardSettings.provider, wizardSettings.experience)
        }
      },
      responseStyle: getResponseStyle(),
      coaching: getCoachingSettings(),
      audio: getAudioSettings(),
      privacy: getPrivacySettings(),
      analytics: getAnalyticsSettings()
    };

    return baseSettings;
  };

  const getRecommendedModel = (provider: string, experience: string) => {
    if (experience === 'beginner') {
      return provider === 'openai' ? 'gpt-4o-mini' : 
             provider === 'claude' ? 'claude-3-haiku-20240307' : 'gemini-pro';
    }
    return provider === 'openai' ? 'gpt-4o' : 
           provider === 'claude' ? 'claude-3-sonnet-20240229' : 'gemini-pro';
  };

  const getResponseStyle = () => {
    const styles = {
      interviews: { tone: 'professional', length: 'detailed', formality: 'formal' },
      presentations: { tone: 'encouraging', length: 'medium', formality: 'semiformal' },
      meetings: { tone: 'professional', length: 'brief', formality: 'formal' },
      general: { tone: 'conversational', length: 'medium', formality: 'casual' }
    };
    return styles[wizardSettings.useCase as keyof typeof styles] || styles.general;
  };

  const getCoachingSettings = () => ({
    enableRealtime: wizardSettings.experience !== 'beginner',
    frameworks: wizardSettings.useCase === 'interviews' ? ['star', 'soar'] : ['basic'],
    experienceLevel: wizardSettings.experience
  });

  const getAudioSettings = () => ({
    inputDevice: 'default',
    outputDevice: 'default',
    noiseReduction: true,
    autoGainControl: true,
    confidenceThreshold: wizardSettings.experience === 'beginner' ? 70 : 80,
    fillerSensitivity: wizardSettings.experience === 'advanced' ? 4 : 3
  });

  const getPrivacySettings = () => {
    const settings = {
      strict: { localDataProcessing: true, sessionRecording: false },
      balanced: { localDataProcessing: true, sessionRecording: true },
      open: { localDataProcessing: false, sessionRecording: true }
    };
    return settings[wizardSettings.privacy as keyof typeof settings];
  };

  const getAnalyticsSettings = () => ({
    enableTracking: wizardSettings.privacy !== 'strict',
    trackWPM: true,
    trackFillers: true,
    trackConfidence: true
  });

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CandidAI!</h2>
              <p className="text-gray-600">Let's set up your personalized AI coaching experience in just a few steps.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Smart Setup</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Your Privacy</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Ready in 2 min</div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">What will you use CandidAI for?</h2>
            <p className="text-gray-600">This helps us customize the AI responses and features for your needs.</p>
            <div className="grid grid-cols-2 gap-3">
              {useCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => setWizardSettings(prev => ({ ...prev, useCase: useCase.id }))}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    wizardSettings.useCase === useCase.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{useCase.icon}</div>
                  <div className="font-medium text-gray-900">{useCase.name}</div>
                  <div className="text-sm text-gray-500">{useCase.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose your AI provider</h2>
            <p className="text-gray-600">Select the AI service you'd like to use. You can always add more later.</p>
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setWizardSettings(prev => ({ ...prev, provider: provider.id }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    wizardSettings.provider === provider.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{provider.name}</span>
                          {provider.recommended && (
                            <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{provider.description}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {wizardSettings.provider && (
              <div className="mt-4">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder={`Enter your ${providers.find(p => p.id === wizardSettings.provider)?.name} API key`}
                  value={wizardSettings.apiKey}
                  onChange={(e) => setWizardSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Don't worry, this is stored securely and only used for your AI requests.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">What's your experience level?</h2>
            <p className="text-gray-600">We'll adjust the interface and features based on your preference.</p>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setWizardSettings(prev => ({ ...prev, experience: level.id }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    wizardSettings.experience === level.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{level.name}</div>
                  <div className="text-sm text-gray-500">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Privacy preferences</h2>
            <p className="text-gray-600">Choose how much data you're comfortable sharing to improve your experience.</p>
            <div className="space-y-3">
              {privacyLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setWizardSettings(prev => ({ ...prev, privacy: level.id }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    wizardSettings.privacy === level.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{level.name}</div>
                  <div className="text-sm text-gray-500">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600">Your personalized CandidAI experience is ready. You can always adjust these settings later.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-gray-900 mb-2">Your Configuration:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Use case: {useCases.find(u => u.id === wizardSettings.useCase)?.name}</div>
                <div>AI Provider: {providers.find(p => p.id === wizardSettings.provider)?.name}</div>
                <div>Experience: {experienceLevels.find(e => e.id === wizardSettings.experience)?.name}</div>
                <div>Privacy: {privacyLevels.find(p => p.id === wizardSettings.privacy)?.name}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return !!wizardSettings.useCase;
      case 2: return !!wizardSettings.provider && !!wizardSettings.apiKey;
      case 3: return !!wizardSettings.experience;
      case 4: return !!wizardSettings.privacy;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip Setup
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            {renderStep()}
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={completeSetup} className="bg-pink-600 hover:bg-pink-700">
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

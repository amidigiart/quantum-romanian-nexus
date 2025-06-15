
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Brain, Target, Clock, Zap, RotateCcw } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const PersonalizationSettings = () => {
  const { 
    personalizationData, 
    updatePersonalization, 
    resetPersonalization,
    isLoading 
  } = usePersonalization();
  const { t } = useLanguage();

  const handleStyleChange = (style: 'formal' | 'casual' | 'technical') => {
    updatePersonalization({ communicationStyle: style });
  };

  const handleLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    updatePersonalization({ learningLevel: level });
  };

  const handleResponseLengthChange = (length: 'concise' | 'detailed' | 'comprehensive') => {
    updatePersonalization({ responseLength: length });
  };

  const handleAdaptiveSettingChange = (setting: keyof typeof personalizationData.adaptiveSettings, value: boolean) => {
    updatePersonalization({
      adaptiveSettings: {
        ...personalizationData.adaptiveSettings,
        [setting]: value
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-white">Loading personalization settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Advanced Personalization</h2>
        </div>
        <Button
          onClick={resetPersonalization}
          variant="outline"
          size="sm"
          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Communication Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <Label className="text-white font-medium">Communication Style</Label>
          </div>
          <Select
            value={personalizationData.communicationStyle}
            onValueChange={handleStyleChange}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="formal" className="text-white hover:bg-gray-800">
                Formal - Professional and structured
              </SelectItem>
              <SelectItem value="casual" className="text-white hover:bg-gray-800">
                Casual - Friendly and conversational
              </SelectItem>
              <SelectItem value="technical" className="text-white hover:bg-gray-800">
                Technical - Detailed and precise
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Learning Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <Label className="text-white font-medium">Learning Level</Label>
          </div>
          <Select
            value={personalizationData.learningLevel}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="beginner" className="text-white hover:bg-gray-800">
                Beginner - Simple explanations
              </SelectItem>
              <SelectItem value="intermediate" className="text-white hover:bg-gray-800">
                Intermediate - Balanced detail
              </SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-800">
                Advanced - Technical depth
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Response Length */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <Label className="text-white font-medium">Response Length</Label>
          </div>
          <Select
            value={personalizationData.responseLength}
            onValueChange={handleResponseLengthChange}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="concise" className="text-white hover:bg-gray-800">
                Concise - Brief and to the point
              </SelectItem>
              <SelectItem value="detailed" className="text-white hover:bg-gray-800">
                Detailed - Comprehensive explanations
              </SelectItem>
              <SelectItem value="comprehensive" className="text-white hover:bg-gray-800">
                Comprehensive - Full context and examples
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Topics */}
        <div className="space-y-3">
          <Label className="text-white font-medium">Preferred Topics</Label>
          <div className="flex flex-wrap gap-2">
            {personalizationData.preferredTopics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-cyan-400 text-cyan-400"
              >
                {topic}
              </Badge>
            ))}
            {personalizationData.preferredTopics.length === 0 && (
              <span className="text-gray-400 text-sm">Based on your user preferences</span>
            )}
          </div>
        </div>

        {/* Adaptive Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <Label className="text-white font-medium">Adaptive Features</Label>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Auto-adjust complexity</span>
              <Switch
                checked={personalizationData.adaptiveSettings.autoAdjustComplexity}
                onCheckedChange={(checked) => handleAdaptiveSettingChange('autoAdjustComplexity', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Remember conversation context</span>
              <Switch
                checked={personalizationData.adaptiveSettings.rememberContext}
                onCheckedChange={(checked) => handleAdaptiveSettingChange('rememberContext', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Personalize examples</span>
              <Switch
                checked={personalizationData.adaptiveSettings.personalizeExamples}
                onCheckedChange={(checked) => handleAdaptiveSettingChange('personalizeExamples', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Suggest related topics</span>
              <Switch
                checked={personalizationData.adaptiveSettings.suggestRelatedTopics}
                onCheckedChange={(checked) => handleAdaptiveSettingChange('suggestRelatedTopics', checked)}
              />
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="space-y-3">
          <Label className="text-white font-medium">Usage Insights</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm text-gray-400">Total Sessions</div>
              <div className="text-lg font-semibold text-white">
                {personalizationData.interactionHistory.totalSessions}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm text-gray-400">Preferred Time</div>
              <div className="text-lg font-semibold text-white">
                {personalizationData.interactionHistory.preferredTimeOfDay}
              </div>
            </div>
          </div>
          
          {personalizationData.interactionHistory.mostUsedFeatures.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-gray-400 mb-2">Most Used Features</div>
              <div className="flex flex-wrap gap-1">
                {personalizationData.interactionHistory.mostUsedFeatures.slice(-5).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

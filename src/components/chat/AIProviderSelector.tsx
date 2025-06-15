
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Search, Zap } from 'lucide-react';

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  icon: React.ReactNode;
  description: string;
  capabilities: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4.1-2025-04-14', 'gpt-4o', 'gpt-4o-mini'],
    icon: <Bot className="w-4 h-4" />,
    description: 'Advanced conversational AI with excellent reasoning',
    capabilities: ['text', 'code', 'analysis']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
    icon: <Brain className="w-4 h-4" />,
    description: 'Highly capable AI with superior reasoning',
    capabilities: ['text', 'analysis', 'creative']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
    icon: <Search className="w-4 h-4" />,
    description: 'Real-time search and web-connected AI',
    capabilities: ['search', 'real-time', 'web-data']
  }
];

interface AIProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  disabled = false
}) => {
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      onProviderChange(providerId);
      // Auto-select the first model when provider changes
      onModelChange(provider.models[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-white">AI Provider</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-300 mb-1 block">Provider</label>
          <Select value={selectedProvider} onValueChange={handleProviderChange} disabled={disabled}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    {provider.icon}
                    <span>{provider.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-1 block">Model</label>
          <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {currentProvider?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentProvider && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">{currentProvider.description}</p>
          <div className="flex flex-wrap gap-1">
            {currentProvider.capabilities.map((capability) => (
              <Badge key={capability} variant="outline" className="text-xs border-cyan-400/50 text-cyan-400">
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

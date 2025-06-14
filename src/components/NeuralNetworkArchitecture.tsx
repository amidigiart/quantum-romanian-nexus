
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Layers, Zap, GitBranch } from 'lucide-react';
import { MLModel } from '@/types/quantumML';

interface NeuralNetworkArchitectureProps {
  currentModel: MLModel;
  isTraining: boolean;
}

export const NeuralNetworkArchitecture: React.FC<NeuralNetworkArchitectureProps> = ({
  currentModel,
  isTraining
}) => {
  const getArchitectureDescription = (model: MLModel) => {
    switch (model.name) {
      case 'Quantum-Classical GAN':
        return {
          description: 'Generator cuantic cu discriminator clasic pentru generare date',
          layers: ['Input Classical', 'Dense Layers', 'Quantum Generator', 'Classical Discriminator', 'Output'],
          advantages: ['Generare date cuantice', 'Stabilitate hibridă', 'Creativitate cuantică']
        };
      case 'Quantum ResNet Hybrid':
        return {
          description: 'ResNet cu blocuri cuantice pentru deep learning avansat',
          layers: ['Conv2D', 'Quantum Residual Block', 'Skip Connections', 'Classical Dense', 'Output'],
          advantages: ['Gradient flow îmbunătățit', 'Reprezentări cuantice', 'Scalabilitate']
        };
      case 'Quantum-Enhanced BERT':
        return {
          description: 'BERT cu atenție cuantică pentru procesare limbaj natural',
          layers: ['Tokenization', 'Classical Embedding', 'Quantum Attention', 'Transformer', 'Output'],
          advantages: ['Atenție cuantică', 'Context superior', 'Paralelism cuantic']
        };
      case 'Quantum Ensemble Network':
        return {
          description: 'Ansamblu de modele cuantice cu fuziune adaptivă',
          layers: ['Input Split', 'Multiple Q-Models', 'Adaptive Fusion', 'Meta-Learning', 'Output'],
          advantages: ['Robustețe crescută', 'Diversity cuantică', 'Performanță superioară']
        };
      default:
        return {
          description: 'Arhitectură hibridă cuantic-clasică standard',
          layers: ['Input', 'Classical Preprocessing', 'Quantum Processing', 'Classical Postprocessing', 'Output'],
          advantages: ['Flexibilitate hibridă', 'Optimizare adaptivă', 'Eficiență computațională']
        };
    }
  };

  const architecture = getArchitectureDescription(currentModel);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-400/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h4 className="text-xl font-semibold text-white">Arhitectură Rețea Neurală</h4>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            <Layers className="w-3 h-3 mr-1" />
            {currentModel.quantumLayers + currentModel.classicalLayers} Straturi
          </Badge>
        </div>
        
        <p className="text-gray-300 mb-6">{architecture.description}</p>

        {/* Layer Visualization */}
        <div className="mb-6">
          <h5 className="text-white font-medium mb-3">Straturi Arhitectură:</h5>
          <div className="flex flex-wrap gap-2">
            {architecture.layers.map((layer, index) => (
              <div key={index} className="flex items-center">
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  layer.toLowerCase().includes('quantum') 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {layer}
                </div>
                {index < architecture.layers.length - 1 && (
                  <GitBranch className="w-4 h-4 text-gray-500 mx-2 rotate-90" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Layers className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-gray-400 text-xs">Straturi Cuantice</div>
            <div className="text-purple-300 font-bold">{currentModel.quantumLayers}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Brain className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-gray-400 text-xs">Straturi Clasice</div>
            <div className="text-blue-300 font-bold">{currentModel.classicalLayers}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-gray-400 text-xs">Parametri Totali</div>
            <div className="text-yellow-300 font-bold">
              {((currentModel.quantumLayers * 50) + (currentModel.classicalLayers * 128)).toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <GitBranch className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-gray-400 text-xs">Conexiuni Hibride</div>
            <div className="text-emerald-300 font-bold">{currentModel.quantumLayers * 2}</div>
          </div>
        </div>

        {/* Advantages */}
        <div>
          <h5 className="text-white font-medium mb-3">Avantaje Arhitectură:</h5>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {architecture.advantages.map((advantage, index) => (
              <div key={index} className="flex items-center gap-2 bg-green-500/10 rounded-lg p-2 border border-green-400/20">
                <Zap className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{advantage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training Indicator */}
        {isTraining && (
          <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 rounded-lg p-3 border border-yellow-400/20">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-300 text-sm">Optimizare arhitectură în progres...</span>
          </div>
        )}
      </div>
    </div>
  );
};

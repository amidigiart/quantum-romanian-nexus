
import { MLModel } from './types';

export const createInitialModels = (): Record<string, MLModel> => ({
  hvqc: {
    name: 'Hybrid Variational Quantum Classifier',
    type: 'classification',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 4,
    classicalLayers: 3,
    hybridEfficiency: 0
  },
  qcnn: {
    name: 'Quantum Convolutional Neural Network',
    type: 'classification',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 6,
    classicalLayers: 2,
    hybridEfficiency: 0
  },
  qrnn: {
    name: 'Quantum Recurrent Neural Network',
    type: 'regression',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 5,
    classicalLayers: 4,
    hybridEfficiency: 0
  },
  qtransformer: {
    name: 'Quantum Transformer',
    type: 'optimization',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 8,
    classicalLayers: 6,
    hybridEfficiency: 0
  },
  qgan: {
    name: 'Quantum-Classical GAN',
    type: 'classification',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 7,
    classicalLayers: 12,
    hybridEfficiency: 0
  },
  qresnet: {
    name: 'Quantum ResNet Hybrid',
    type: 'classification',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 9,
    classicalLayers: 15,
    hybridEfficiency: 0
  },
  qbert: {
    name: 'Quantum-Enhanced BERT',
    type: 'optimization',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 12,
    classicalLayers: 24,
    hybridEfficiency: 0
  },
  qensemble: {
    name: 'Quantum Ensemble Network',
    type: 'classification',
    accuracy: 0,
    quantumAccuracy: 0,
    classicalAccuracy: 0,
    loss: 1.0,
    epochs: 0,
    status: 'idle',
    quantumLayers: 16,
    classicalLayers: 8,
    hybridEfficiency: 0
  }
});

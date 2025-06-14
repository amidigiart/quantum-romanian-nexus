
import { Brain, Lock, Search, Zap, Calculator, Shuffle, Target, Cpu, Shield, TrendingUp } from 'lucide-react';
import { Algorithm } from './types';

export const algorithms: Algorithm[] = [
  {
    id: 'grover',
    name: 'Grover Search',
    icon: Search,
    description: 'Căutare cuantică în baze de date nesortate',
    complexity: 'O(√N)',
    color: 'text-blue-400'
  },
  {
    id: 'shor',
    name: 'Shor Factoring',
    icon: Lock,
    description: 'Factorizarea numerelor întregi mari',
    complexity: 'O((log N)³)',
    color: 'text-red-400'
  },
  {
    id: 'qaoa',
    name: 'QAOA Optimization',
    icon: Target,
    description: 'Algoritm de optimizare cuantică aproximativă',
    complexity: 'O(p·m)',
    color: 'text-green-400'
  },
  {
    id: 'vqe',
    name: 'VQE Energy',
    icon: Zap,
    description: 'Estimarea energiei stării fundamentale',
    complexity: 'O(N⁴)',
    color: 'text-yellow-400'
  },
  {
    id: 'qml',
    name: 'Quantum ML',
    icon: Brain,
    description: 'Învățare automată cuantică hibridă',
    complexity: 'O(log N)',
    color: 'text-purple-400'
  },
  {
    id: 'qrng',
    name: 'Quantum RNG',
    icon: Shuffle,
    description: 'Generator de numere aleatoare cuantice',
    complexity: 'O(1)',
    color: 'text-cyan-400'
  },
  {
    id: 'qft',
    name: 'Quantum FFT',
    icon: Calculator,
    description: 'Transformata Fourier cuantică',
    complexity: 'O((log N)²)',
    color: 'text-orange-400'
  },
  {
    id: 'qec',
    name: 'Error Correction',
    icon: Shield,
    description: 'Corecția erorilor cuantice',
    complexity: 'O(n³)',
    color: 'text-pink-400'
  },
  {
    id: 'qsim',
    name: 'Quantum Simulation',
    icon: Cpu,
    description: 'Simularea sistemelor cuantice complexe',
    complexity: 'O(2ⁿ)',
    color: 'text-indigo-400'
  },
  {
    id: 'qopt',
    name: 'Portfolio Optimization',
    icon: TrendingUp,
    description: 'Optimizarea portofoliului de investiții',
    complexity: 'O(N·M)',
    color: 'text-emerald-400'
  }
];

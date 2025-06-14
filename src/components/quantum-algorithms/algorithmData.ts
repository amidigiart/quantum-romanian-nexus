import { Brain, Lock, Search, Zap, Calculator, Shuffle, Target, Cpu, Shield, TrendingUp, Network, Layers, GitBranch, Sparkles, Atom, Database } from 'lucide-react';
import { Algorithm } from './types';

export const algorithms: Algorithm[] = [
  {
    id: 'grover',
    name: 'Grover Search',
    icon: Search,
    description: 'Căutare cuantică în baze de date nesortate',
    complexity: 'O(√N)',
    color: 'text-blue-400',
    category: 'Search',
    qubits: 4
  },
  {
    id: 'shor',
    name: 'Shor Factoring',
    icon: Lock,
    description: 'Factorizarea numerelor întregi mari',
    complexity: 'O((log N)³)',
    color: 'text-red-400',
    category: 'Factoring',
    qubits: 8
  },
  {
    id: 'qaoa',
    name: 'QAOA Optimization',
    icon: Target,
    description: 'Algoritm de optimizare cuantică aproximativă',
    complexity: 'O(p·m)',
    color: 'text-green-400',
    category: 'Optimization',
    qubits: 6
  },
  {
    id: 'vqe',
    name: 'VQE Energy',
    icon: Zap,
    description: 'Estimarea energiei stării fundamentale',
    complexity: 'O(N⁴)',
    color: 'text-yellow-400',
    category: 'Chemistry',
    qubits: 4
  },
  {
    id: 'qml',
    name: 'Quantum ML',
    icon: Brain,
    description: 'Învățare automată cuantică hibridă',
    complexity: 'O(log N)',
    color: 'text-purple-400',
    category: 'Machine Learning',
    qubits: 5
  },
  {
    id: 'qrng',
    name: 'Quantum RNG',
    icon: Shuffle,
    description: 'Generator de numere aleatoare cuantice',
    complexity: 'O(1)',
    color: 'text-cyan-400',
    category: 'Utility',
    qubits: 2
  },
  {
    id: 'qft',
    name: 'Quantum FFT',
    icon: Calculator,
    description: 'Transformata Fourier cuantică',
    complexity: 'O((log N)²)',
    color: 'text-orange-400',
    category: 'Transform',
    qubits: 6
  },
  {
    id: 'qec',
    name: 'Error Correction',
    icon: Shield,
    description: 'Corecția erorilor cuantice',
    complexity: 'O(n³)',
    color: 'text-pink-400',
    category: 'Error Correction',
    qubits: 9
  },
  {
    id: 'qsim',
    name: 'Quantum Simulation',
    icon: Cpu,
    description: 'Simularea sistemelor cuantice complexe',
    complexity: 'O(2ⁿ)',
    color: 'text-indigo-400',
    category: 'Simulation',
    qubits: 7
  },
  {
    id: 'qopt',
    name: 'Portfolio Optimization',
    icon: TrendingUp,
    description: 'Optimizarea portofoliului de investiții',
    complexity: 'O(N·M)',
    color: 'text-emerald-400',
    category: 'Finance',
    qubits: 5
  },
  {
    id: 'hybrid-qaoa-vqe',
    name: 'Hybrid QAOA-VQE',
    icon: GitBranch,
    description: 'Combinație adaptivă QAOA și VQE pentru optimizare complexă',
    complexity: 'O(p·N⁴)',
    color: 'text-teal-400',
    category: 'Hybrid Optimization',
    qubits: 8
  },
  {
    id: 'quantum-annealing-hybrid',
    name: 'Quantum Annealing Hybrid',
    icon: Sparkles,
    description: 'Hibrid între annealing cuantic și optimizare clasică',
    complexity: 'O(T·log N)',
    color: 'text-violet-400',
    category: 'Hybrid Annealing',
    qubits: 12
  },
  {
    id: 'variational-quantum-eigensolver-plus',
    name: 'VQE+ Enhanced',
    icon: Atom,
    description: 'VQE îmbunătățit cu tehnici de învățare adaptivă',
    complexity: 'O(N⁴·log p)',
    color: 'text-amber-400',
    category: 'Enhanced Chemistry',
    qubits: 6
  },
  {
    id: 'quantum-approximate-counting',
    name: 'Q-Approximate Counting',
    icon: Calculator,
    description: 'Numărare aproximativă cu accelerare cuantică',
    complexity: 'O(√N/ε)',
    color: 'text-lime-400',
    category: 'Counting',
    qubits: 5
  },
  {
    id: 'hybrid-neural-quantum',
    name: 'Neural-Quantum Hybrid',
    icon: Network,
    description: 'Rețele neurale cu straturi cuantice integrate',
    complexity: 'O(L·N·log M)',
    color: 'text-rose-400',
    category: 'Hybrid ML',
    qubits: 10
  },
  {
    id: 'quantum-reinforcement-learning',
    name: 'Quantum RL',
    icon: Brain,
    description: 'Învățare prin întărire cu avantaj cuantic',
    complexity: 'O(S·A·log H)',
    color: 'text-fuchsia-400',
    category: 'Quantum RL',
    qubits: 7
  },
  {
    id: 'adaptive-qaoa',
    name: 'Adaptive QAOA',
    icon: Layers,
    description: 'QAOA cu strategie adaptivă de parametri',
    complexity: 'O(p²·m)',
    color: 'text-sky-400',
    category: 'Adaptive Optimization',
    qubits: 9
  },
  {
    id: 'quantum-database-search',
    name: 'Q-Database Search',
    icon: Database,
    description: 'Căutare hibridă în baze de date mari',
    complexity: 'O(√N·log D)',
    color: 'text-emerald-500',
    category: 'Database',
    qubits: 6
  }
];

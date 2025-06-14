
import { NewsArticle } from '@/types/news';
import { Zap, TrendingUp, ExternalLink, Rss } from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'breakthrough':
      return Zap;
    case 'research':
      return TrendingUp;
    case 'industry':
      return ExternalLink;
    default:
      return Rss;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'breakthrough':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'research':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'industry':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Acum câteva minute';
  if (diffInHours < 24) return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
};

export const generateQuantumNews = (): NewsArticle[] => {
  const newsTemplates = [
    {
      title: "IBM Unveils New 1000-Qubit Quantum Processor",
      description: "IBM has announced its latest quantum computing breakthrough with a new processor featuring over 1000 qubits, marking a significant milestone in quantum supremacy.",
      source: "IBM Research",
      category: 'breakthrough' as const
    },
    {
      title: "Google's Quantum AI Achieves Error Correction Milestone",
      description: "Google's quantum team demonstrates practical quantum error correction, bringing fault-tolerant quantum computing closer to reality.",
      source: "Google AI",
      category: 'research' as const
    },
    {
      title: "Microsoft Azure Quantum Cloud Services Expand Globally",
      description: "Microsoft announces global expansion of Azure Quantum cloud services, making quantum computing accessible to more researchers worldwide.",
      source: "Microsoft",
      category: 'industry' as const
    },
    {
      title: "MIT Researchers Develop Room-Temperature Quantum Sensors",
      description: "New breakthrough in quantum sensing technology could revolutionize medical imaging and navigation systems.",
      source: "MIT Technology Review",
      category: 'research' as const
    },
    {
      title: "Quantum Computing Startup Raises $100M in Series B",
      description: "Another quantum computing startup secures significant funding to accelerate quantum hardware development.",
      source: "TechCrunch",
      category: 'industry' as const
    },
    {
      title: "China Launches National Quantum Computing Initiative",
      description: "Chinese government announces massive investment in quantum computing research and development infrastructure.",
      source: "Reuters",
      category: 'general' as const
    }
  ];

  return newsTemplates.map((template, index) => ({
    id: `quantum-news-${Date.now()}-${index}`,
    ...template,
    url: `https://example.com/quantum-news/${index}`,
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }));
};

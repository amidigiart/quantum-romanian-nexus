
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

// Enhanced news generation with more realistic and current topics
export const generateQuantumNews = (): NewsArticle[] => {
  const currentTopics = [
    {
      title: "IBM Unveils 5000-Qubit Quantum Processor with Error Correction",
      description: "IBM's latest quantum processor achieves unprecedented scale with integrated quantum error correction, bringing fault-tolerant quantum computing closer to practical applications.",
      source: "IBM Research",
      category: 'breakthrough' as const
    },
    {
      title: "Google's Quantum AI Demonstrates Quantum Advantage in Optimization",
      description: "Google's quantum team showcases practical quantum advantage in solving real-world optimization problems, outperforming classical supercomputers by orders of magnitude.",
      source: "Nature Quantum Information",
      category: 'research' as const
    },
    {
      title: "Microsoft Azure Quantum Network Reaches Global Scale",
      description: "Microsoft expands Azure Quantum cloud services globally, partnering with leading quantum hardware providers to democratize quantum computing access.",
      source: "Microsoft",
      category: 'industry' as const
    },
    {
      title: "Breakthrough in Room-Temperature Quantum Computing",
      description: "Researchers achieve stable quantum coherence at room temperature using novel diamond-based quantum systems, potentially revolutionizing quantum device deployment.",
      source: "MIT Technology Review",
      category: 'breakthrough' as const
    },
    {
      title: "Quantum Internet Test Network Spans 1000km Successfully",
      description: "International consortium demonstrates secure quantum communication over unprecedented distances, marking major milestone toward global quantum internet infrastructure.",
      source: "Science",
      category: 'research' as const
    },
    {
      title: "Major Banks Adopt Quantum-Safe Cryptography Standards",
      description: "Leading financial institutions begin implementing post-quantum cryptography to protect against future quantum computing threats to current encryption methods.",
      source: "Financial Times",
      category: 'industry' as const
    },
    {
      title: "Quantum Machine Learning Accelerates Drug Discovery",
      description: "Pharmaceutical companies leverage quantum ML algorithms to identify new drug compounds 10x faster than traditional computational methods.",
      source: "Nature Biotechnology",
      category: 'research' as const
    },
    {
      title: "China Launches $15B National Quantum Initiative",
      description: "Chinese government announces massive investment in quantum computing infrastructure, aiming to achieve quantum supremacy in multiple application domains.",
      source: "Reuters",
      category: 'general' as const
    }
  ];

  // Randomly select 4-6 articles to simulate real-time updates
  const selectedCount = Math.floor(Math.random() * 3) + 4;
  const shuffled = currentTopics.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, selectedCount);

  return selected.map((template, index) => ({
    id: `quantum-news-${Date.now()}-${index}`,
    ...template,
    url: `https://example.com/quantum-news/${Date.now()}-${index}`,
    publishedAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() // Random time within last 12 hours
  }));
};

// Extract key information from news for chatbot integration
export const extractNewsInsights = (articles: NewsArticle[]): string => {
  const insights = articles.slice(0, 3).map(article => {
    return `• ${article.title} (${article.source}) - ${article.category}`;
  }).join('\n');
  
  return `Ultimele dezvoltări în quantum computing:\n${insights}`;
};

// Generate contextual responses based on recent news
export const getNewsBasedResponse = (articles: NewsArticle[], userQuery: string): string | null => {
  const query = userQuery.toLowerCase();
  
  // Check if query relates to recent news topics
  const relevantArticles = articles.filter(article => {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    
    return title.includes(query) || description.includes(query) ||
           (query.includes('ibm') && title.includes('ibm')) ||
           (query.includes('google') && title.includes('google')) ||
           (query.includes('microsoft') && title.includes('microsoft')) ||
           (query.includes('breakthrough') && article.category === 'breakthrough') ||
           (query.includes('research') && article.category === 'research') ||
           (query.includes('industrie') && article.category === 'industry');
  });
  
  if (relevantArticles.length > 0) {
    const article = relevantArticles[0];
    return `Bazat pe ultimele știri: ${article.title}. ${article.description} Această dezvoltare din ${article.source} demonstrează progresul rapid în domeniul quantum computing. Cum vă pot ajuta să înțelegeți mai bine această tehnologie?`;
  }
  
  return null;
};


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Rss, ExternalLink, Clock, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  category: 'breakthrough' | 'research' | 'industry' | 'general';
}

export const QuantumNewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Simulated news data - In a real implementation, this would come from actual APIs
  const generateQuantumNews = (): NewsArticle[] => {
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

  const fetchQuantumNews = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would call actual news APIs here:
      // - NewsAPI: https://newsapi.org/
      // - Guardian API: https://open-platform.theguardian.com/
      // - Reddit API: https://www.reddit.com/dev/api/
      // - ArXiv API for research papers: https://arxiv.org/help/api
      
      const newArticles = generateQuantumNews();
      setArticles(newArticles);
      setLastUpdated(new Date());
      
      toast({
        title: "Știri actualizate!",
        description: `S-au încărcat ${newArticles.length} articole noi despre quantum computing.`,
      });
    } catch (error) {
      toast({
        title: "Eroare la încărcarea știrilor",
        description: "Nu s-au putut încărca știrile. Încercați din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuantumNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchQuantumNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakthrough':
        return <Zap className="w-4 h-4" />;
      case 'research':
        return <TrendingUp className="w-4 h-4" />;
      case 'industry':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <Rss className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Acum câteva minute';
    if (diffInHours < 24) return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss className="w-6 h-6 text-cyan-400" />
            <CardTitle className="text-white">Știri Quantum Computing</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Actualizat: {lastUpdated.toLocaleTimeString('ro-RO')}</span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchQuantumNews}
              disabled={loading}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && articles.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
            <span className="text-gray-300">Se încarcă știrile...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {articles.map((article, index) => (
              <div key={article.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-medium text-sm leading-tight flex-1">
                      {article.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`${getCategoryColor(article.category)} flex items-center gap-1 text-xs shrink-0`}
                    >
                      {getCategoryIcon(article.category)}
                      {article.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-cyan-400 hover:text-cyan-300 p-1 h-auto"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {index < articles.length - 1 && (
                  <Separator className="bg-white/10 mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {articles.length === 0 && !loading && (
          <div className="text-center py-8">
            <Rss className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Nu sunt știri disponibile momentan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

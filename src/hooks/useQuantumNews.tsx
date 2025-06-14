
import { useState, useEffect } from 'react';
import { NewsArticle } from '@/types/news';
import { generateQuantumNews } from '@/utils/newsUtils';
import { useToast } from '@/hooks/use-toast';

export const useQuantumNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

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

  return {
    articles,
    loading,
    lastUpdated,
    fetchQuantumNews
  };
};

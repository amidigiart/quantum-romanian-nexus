
import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '@/types/news';
import { generateQuantumNews, extractNewsInsights } from '@/utils/newsUtils';
import { useToast } from '@/hooks/use-toast';

interface NewsContextData {
  articles: NewsArticle[];
  insights: string;
  lastUpdated: Date | null;
}

export const useQuantumNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newsContext, setNewsContext] = useState<string>('');
  const { toast } = useToast();

  const fetchQuantumNews = useCallback(async (showToast: boolean = true) => {
    setLoading(true);
    
    try {
      // Simulate realistic API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // In a real implementation, you would call actual news APIs here:
      // - NewsAPI: https://newsapi.org/v2/everything?q=quantum+computing
      // - Guardian API: https://content.guardianapis.com/search?q=quantum+computing
      // - Reddit API: https://www.reddit.com/r/QuantumComputing.json
      // - ArXiv API: http://export.arxiv.org/api/query?search_query=cat:quant-ph
      
      const newArticles = generateQuantumNews();
      const insights = extractNewsInsights(newArticles);
      
      setArticles(newArticles);
      setNewsContext(insights);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast({
          title: "Știri actualizate!",
          description: `S-au încărcat ${newArticles.length} articole noi despre quantum computing.`,
        });
      }
    } catch (error) {
      console.error('Error fetching quantum news:', error);
      if (showToast) {
        toast({
          title: "Eroare la încărcarea știrilor",
          description: "Nu s-au putut încărca știrile. Încercați din nou.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Real-time news updates
  useEffect(() => {
    // Initial fetch
    fetchQuantumNews(false);
    
    // Auto-refresh every 3 minutes for more dynamic updates
    const interval = setInterval(() => {
      fetchQuantumNews(false);
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchQuantumNews]);

  // Provide news context for chatbot integration
  const getNewsContext = useCallback((): NewsContextData => {
    return {
      articles,
      insights: newsContext,
      lastUpdated
    };
  }, [articles, newsContext, lastUpdated]);

  // Get news-based response for chatbot
  const getNewsResponse = useCallback((query: string): string | null => {
    const query_lower = query.toLowerCase();
    
    // Check if query relates to recent news
    const relevantArticles = articles.filter(article => {
      const title = article.title.toLowerCase();
      const description = article.description.toLowerCase();
      
      return title.includes(query_lower) || 
             description.includes(query_lower) ||
             (query_lower.includes('ultimele') && query_lower.includes('știri')) ||
             (query_lower.includes('noutăți') && query_lower.includes('quantum')) ||
             (query_lower.includes('dezvoltări'));
    });
    
    if (relevantArticles.length > 0 || (query_lower.includes('știri') && query_lower.includes('quantum'))) {
      const topArticles = articles.slice(0, 3);
      const newsUpdate = topArticles.map((article, index) => 
        `${index + 1}. ${article.title} (${article.source}) - ${formatTimeAgo(article.publishedAt)}`
      ).join('\n\n');
      
      return `Iată ultimele dezvoltări în quantum computing:\n\n${newsUpdate}\n\nAceste știri demonstrează progresul rapid în domeniu. Doriți să discutăm despre vreo dezvoltare specifică?`;
    }
    
    return null;
  }, [articles]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Acum câteva minute';
    if (diffInHours < 24) return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
  };

  return {
    articles,
    loading,
    lastUpdated,
    newsContext,
    fetchQuantumNews: () => fetchQuantumNews(true),
    getNewsContext,
    getNewsResponse
  };
};

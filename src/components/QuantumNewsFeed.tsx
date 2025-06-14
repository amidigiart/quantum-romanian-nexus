
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Rss, RefreshCw } from 'lucide-react';
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { NewsArticle } from '@/components/NewsArticle';
import { NewsFeedHeader } from '@/components/NewsFeedHeader';

export const QuantumNewsFeed = () => {
  const { articles, loading, lastUpdated, fetchQuantumNews } = useQuantumNews();

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <NewsFeedHeader 
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={fetchQuantumNews}
        />
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
                <NewsArticle article={article} />
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

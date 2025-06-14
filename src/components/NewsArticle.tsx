
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { NewsArticle as NewsArticleType } from '@/types/news';
import { getCategoryIcon, getCategoryColor, formatTimeAgo } from '@/utils/newsUtils';

interface NewsArticleProps {
  article: NewsArticleType;
}

export const NewsArticle: React.FC<NewsArticleProps> = ({ article }) => {
  const CategoryIcon = getCategoryIcon(article.category);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-white font-medium text-sm leading-tight flex-1">
          {article.title}
        </h4>
        <Badge 
          variant="outline" 
          className={`${getCategoryColor(article.category)} flex items-center gap-1 text-xs shrink-0`}
        >
          <CategoryIcon className="w-4 h-4" />
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
  );
};

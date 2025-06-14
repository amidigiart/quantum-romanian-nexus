
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  category: 'breakthrough' | 'research' | 'industry' | 'general';
}

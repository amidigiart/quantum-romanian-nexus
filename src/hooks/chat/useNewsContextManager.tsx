
import { useState, useCallback } from 'react';
import { NewsContext } from './types/conversationTypes';

export const useNewsContextManager = () => {
  const [newsContext, setNewsContext] = useState<NewsContext>({
    news: [],
    lastUpdated: null,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateNewsContext = useCallback(async () => {
    try {
      // Mock data since quantum_news table doesn't exist
      const mockNewsData = [
        {
          id: '1',
          title: 'Quantum Computing Breakthrough',
          summary: 'New quantum algorithm shows 1000x speedup',
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'IBM Announces New Quantum Processor',
          summary: 'IBM reveals 1000-qubit quantum processor',
          created_at: new Date().toISOString()
        }
      ];

      setNewsContext({
        news: mockNewsData,
        lastUpdated: new Date(),
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error updating news context:", error);
    }
  }, []);

  const getNewsResponse = (message: string): string | null => {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('știri quantum') || normalizedMessage.includes('ultimele noutăți')) {
      if (!newsContext.news || newsContext.news.length === 0) {
        return "Nu există noutăți disponibile momentan.";
      }

      const newsItems = newsContext.news.map((item, index) =>
        `${index + 1}. ${item.title} - ${item.summary}`
      ).join('\n');

      return `Ultimele noutăți quantum:\n${newsItems}\nData actualizării: ${lastUpdated?.toLocaleDateString()}`;
    }

    return null;
  };

  return {
    newsContext,
    lastUpdated,
    updateNewsContext,
    getNewsResponse
  };
};


import { supabase } from '@/integrations/supabase/client';
import { databaseConnectionPool } from './connectionPoolManager';
import { queryResultCache } from './queryResultCache';

export interface QueryExecutionOptions {
  useCache?: boolean;
  cacheTtl?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
  retries?: number;
}

export interface BatchQueryOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  failFast?: boolean;
}

// Define valid table names type
type TableName = 'chat_conversations' | 'chat_messages' | 'profiles' | 'team_memberships' | 'teams' | 'user_preferences' | 'user_roles';

export class OptimizedQueryExecutor {
  async executeQuery<T>(
    queryKey: string,
    queryBuilder: () => any,
    options: QueryExecutionOptions = {}
  ): Promise<T> {
    const {
      useCache = true,
      cacheTtl = 300000,
      tags = [],
      priority = 'medium',
      timeout = 30000,
      retries = 2
    } = options;

    const executeWithConnection = async (): Promise<T> => {
      return databaseConnectionPool.withConnection(async () => {
        const query = queryBuilder();
        
        // Add timeout to query
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        );

        const { data, error } = await Promise.race([
          query,
          timeoutPromise
        ]);

        if (error) throw error;
        return data as T;
      });
    };

    if (useCache) {
      return queryResultCache.getCachedQuery(
        queryKey,
        executeWithConnection,
        { ttl: cacheTtl, tags, priority }
      );
    }

    return executeWithConnection();
  }

  async executeConversationSearch(
    userId: string,
    searchTerm: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const queryKey = `conversation_search:${userId}:${searchTerm}:${limit}:${offset}`;
    
    return this.executeQuery(
      queryKey,
      () => {
        let query = supabase
          .from('chat_conversations')
          .select(`
            id,
            title,
            created_at,
            updated_at,
            chat_messages(count)
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        return query;
      },
      {
        tags: [`user:${userId}`, 'conversations', 'search'],
        cacheTtl: 120000, // 2 minutes for search results
        priority: 'high'
      }
    );
  }

  async executeMessageSearch(
    userId: string,
    searchQuery: string,
    limit: number = 50
  ): Promise<any[]> {
    const queryKey = `message_search:${userId}:${searchQuery}:${limit}`;
    
    return this.executeQuery(
      queryKey,
      () => supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          message_type,
          created_at,
          conversation_id,
          chat_conversations!inner(
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .textSearch('content', searchQuery)
        .order('created_at', { ascending: false })
        .limit(limit),
      {
        tags: [`user:${userId}`, 'messages', 'search'],
        cacheTtl: 180000, // 3 minutes for message search
        priority: 'medium'
      }
    );
  }

  async executeMessagesLoad(
    conversationId: string,
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const queryKey = `messages:${conversationId}:${limit}:${offset}`;
    
    return this.executeQuery(
      queryKey,
      () => supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1),
      {
        tags: [`conversation:${conversationId}`, `user:${userId}`, 'messages'],
        cacheTtl: 600000, // 10 minutes for message loads
        priority: 'high'
      }
    );
  }

  async executeBatchInsert(
    tableName: TableName,
    records: any[],
    options: BatchQueryOptions = {}
  ): Promise<any[]> {
    const {
      batchSize = 50,
      delayBetweenBatches = 100,
      failFast = false
    } = options;

    const results: any[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const batchResult = await databaseConnectionPool.withConnection(async () => {
          const { data, error } = await supabase
            .from(tableName)
            .insert(batch)
            .select();

          if (error) throw error;
          return data;
        });

        results.push(...(batchResult || []));
        
        // Add delay between batches to avoid overwhelming the database
        if (i + batchSize < records.length && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
        
      } catch (error) {
        const batchError = error instanceof Error ? error : new Error('Batch insert failed');
        errors.push(batchError);
        
        if (failFast) {
          throw batchError;
        }
        
        console.error(`Batch insert failed for batch ${Math.floor(i / batchSize) + 1}:`, batchError);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`All batch operations failed. Last error: ${errors[errors.length - 1].message}`);
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} batch operations failed out of ${Math.ceil(records.length / batchSize)} total batches`);
    }

    return results;
  }

  async executeBatchUpdate(
    tableName: TableName,
    updates: Array<{ id: string; data: any }>,
    options: BatchQueryOptions = {}
  ): Promise<void> {
    const {
      batchSize = 25,
      delayBetweenBatches = 150,
      failFast = false
    } = options;

    const errors: Error[] = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      try {
        await databaseConnectionPool.withConnection(async () => {
          const promises = batch.map(({ id, data }) =>
            supabase
              .from(tableName)
              .update(data)
              .eq('id', id)
          );

          const results = await Promise.allSettled(promises);
          
          const failures = results
            .map((result, index) => ({ result, index }))
            .filter(({ result }) => result.status === 'rejected');

          if (failures.length > 0) {
            throw new Error(`${failures.length} updates failed in batch`);
          }
        });
        
        if (i + batchSize < updates.length && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
        
      } catch (error) {
        const batchError = error instanceof Error ? error : new Error('Batch update failed');
        errors.push(batchError);
        
        if (failFast) {
          throw batchError;
        }
        
        console.error(`Batch update failed for batch ${Math.floor(i / batchSize) + 1}:`, batchError);
      }
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} batch update operations failed out of ${Math.ceil(updates.length / batchSize)} total batches`);
    }
  }

  async preloadQueries(queries: Array<{
    key: string;
    builder: () => any;
    options?: QueryExecutionOptions;
  }>): Promise<void> {
    const preloadPromises = queries.map(({ key, builder, options = {} }) =>
      queryResultCache.preloadQuery(
        key,
        () => databaseConnectionPool.withConnection(async () => {
          const { data, error } = await builder();
          if (error) throw error;
          return data;
        }),
        { ...options, priority: 'low' }
      )
    );

    await Promise.allSettled(preloadPromises);
    console.log(`Preloaded ${queries.length} queries`);
  }

  getConnectionMetrics() {
    return databaseConnectionPool.getMetrics();
  }

  getCacheMetrics() {
    return queryResultCache.getMetrics();
  }

  async invalidateCache(tags: string[]): Promise<number> {
    let invalidatedCount = 0;
    for (const tag of tags) {
      try {
        const count = await queryResultCache.invalidateQueryPattern(tag);
        invalidatedCount += count;
      } catch (error) {
        console.error(`Error invalidating cache for tag ${tag}:`, error);
      }
    }
    return invalidatedCount;
  }
}

export const optimizedQueryExecutor = new OptimizedQueryExecutor();

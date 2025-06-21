
export type RequestPriority = 'critical' | 'high' | 'normal' | 'low';

export interface PriorityRequest {
  id: string;
  priority: RequestPriority;
  message: string;
  context?: any;
  userId?: string;
  conversationId?: string;
  timestamp: number;
  requestFn: () => Promise<any>;
  retryCount?: number;
  maxRetries?: number;
  timeoutMs?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
}

export interface QueueStats {
  totalRequests: number;
  processingRequests: number;
  completedRequests: number;
  failedRequests: number;
  queueSizes: Record<RequestPriority, number>;
  averageWaitTime: number;
  averageProcessingTime: number;
  throughput: number; // requests per second
}

export interface PriorityQueueConfig {
  maxConcurrentRequests: number;
  maxQueueSize: number;
  timeoutMs: number;
  retryAttempts: number;
  fairnessRatio: number; // 0-1, how much to favor high priority vs fairness
  starvationPreventionMs: number; // max time a request can wait
}

export const DEFAULT_PRIORITY_CONFIG: PriorityQueueConfig = {
  maxConcurrentRequests: 5,
  maxQueueSize: 1000,
  timeoutMs: 30000,
  retryAttempts: 3,
  fairnessRatio: 0.7,
  starvationPreventionMs: 120000 // 2 minutes
};

export interface QueueEventHandlers {
  onRequestQueued?: (request: PriorityRequest) => void;
  onRequestStarted?: (request: PriorityRequest) => void;
  onRequestCompleted?: (request: PriorityRequest, result: any) => void;
  onRequestFailed?: (request: PriorityRequest, error: Error) => void;
  onRequestTimeout?: (request: PriorityRequest) => void;
  onQueueOverflow?: (droppedRequest: PriorityRequest) => void;
}

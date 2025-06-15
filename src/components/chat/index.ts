
// Tree-shakable exports for chat components
// Only import what you need to reduce bundle size

// Core components (always loaded)
export { MessageInput } from './MessageInput';
export { QuickActions } from './QuickActions';
export { VirtualizedMessageList } from './VirtualizedMessageList';
export { WelcomeMessage } from './WelcomeMessage';

// Lazy-loaded components (loaded on demand)
export const LazyAIProviderSelector = () => import('./LazyAIProviderSelector').then(m => m.LazyAIProviderSelector);
export const LazyEnhancedChatInterface = () => import('./LazyEnhancedChatInterface').then(m => m.LazyEnhancedChatInterface);
export const OptimizedChatInterface = () => import('./OptimizedChatInterface').then(m => m.OptimizedChatInterface);

// Advanced components (loaded only when features are enabled)
export const loadCacheAnalytics = () => import('./CacheAnalytics');
export const loadResponseQualityIndicator = () => import('./ResponseQualityIndicator');
export const loadTypingHandler = () => import('./TypingHandler');
export const loadPresenceIndicator = () => import('./PresenceIndicator');

// Provider utilities (tree-shakable)
export * from './providers';

// Types (no runtime cost) - import from the lazy hook instead
export type { AIProviderConfig } from '../hooks/chat/useLazyMultiProviderBotResponses';

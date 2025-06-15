
// Tree-shakable exports for AI providers
export { AI_PROVIDERS } from '../AIProviderSelector';
export type { AIProvider } from '../AIProviderSelector';

// Lazy-loaded provider utilities
export const getProviderById = (id: string) => {
  return import('../AIProviderSelector').then(module => 
    module.AI_PROVIDERS.find(p => p.id === id)
  );
};

export const getProviderModels = (providerId: string) => {
  return import('../AIProviderSelector').then(module => {
    const provider = module.AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.models || [];
  });
};

export const validateProviderModel = (providerId: string, model: string) => {
  return import('../AIProviderSelector').then(module => {
    const provider = module.AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.models.includes(model) || false;
  });
};

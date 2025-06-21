
export interface RequestFingerprint {
  contentHash: string;
  semanticHash: string;
  contextHash: string;
  userHash: string;
  timestamp: number;
}

export interface FingerprintingConfig {
  includeUserContext: boolean;
  includeTiming: boolean;
  semanticSimilarityThreshold: number;
  contextWeight: number;
}

export const DEFAULT_CONFIG: FingerprintingConfig = {
  includeUserContext: true,
  includeTiming: false,
  semanticSimilarityThreshold: 0.85,
  contextWeight: 0.3
};

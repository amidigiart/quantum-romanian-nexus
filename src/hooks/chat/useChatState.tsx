
import { useState } from 'react';

export const useChatState = () => {
  const [inputValue, setInputValue] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);

  return {
    inputValue,
    setInputValue,
    useEnhancedMode,
    setUseEnhancedMode
  };
};

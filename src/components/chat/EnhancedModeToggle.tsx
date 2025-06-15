
import React from 'react';

interface EnhancedModeToggleProps {
  useEnhancedMode: boolean;
  onChange: (enabled: boolean) => void;
}

export const EnhancedModeToggle: React.FC<EnhancedModeToggleProps> = ({
  useEnhancedMode,
  onChange
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input 
          type="checkbox" 
          checked={useEnhancedMode}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded"
        />
        Activează AI Avansat
      </label>
    </div>
  );
};

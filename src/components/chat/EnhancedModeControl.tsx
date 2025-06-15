
import React from 'react';

interface EnhancedModeControlProps {
  isEnhanced: boolean;
  onChange: (enhanced: boolean) => void;
  disabled?: boolean;
}

export const EnhancedModeControl = React.memo<EnhancedModeControlProps>(({ 
  isEnhanced, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input 
          type="checkbox" 
          checked={isEnhanced}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="rounded"
        />
        Mod AI Avansat
      </label>
    </div>
  );
});

EnhancedModeControl.displayName = 'EnhancedModeControl';

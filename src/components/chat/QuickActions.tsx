
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, Brain, Atom, Microchip, Newspaper } from 'lucide-react';

interface QuickAction {
  text: string;
  action: string;
}

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  disabled?: boolean;
  enhanced?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onActionClick, 
  disabled = false, 
  enhanced = false 
}) => {
  const quickActions: QuickAction[] = [
    { text: 'Algoritmi Cuantici', action: 'Explică-mi algoritmii Grover și Shor cu ultimele dezvoltări' },
    { text: 'Criptografie Cuantică', action: 'Cum funcționează protocolul BB84 și adoptarea industrială?' },
    { text: 'Quantum ML', action: 'Care sunt ultimele progrese în învățarea automată cuantică?' },
    { text: 'Optimizare QAOA', action: 'Explică algoritmul QAOA cu exemple concrete' },
    { text: 'Simulare Cuantică', action: 'Cum simulez sisteme cuantice la temperatura camerei?' },
    { text: 'Ultimele Știri', action: 'Care sunt ultimele dezvoltări în quantum computing?' }
  ];

  const icons = [Calculator, Shield, Brain, Atom, Microchip, Newspaper];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
      {quickActions.map((action, index) => {
        const IconComponent = icons[index];
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.action)}
            disabled={disabled}
            className={`border-white/30 text-white hover:bg-white/20 transition-all hover:scale-105 text-xs ${
              enhanced ? 'border-cyan-400/50 text-cyan-100' : ''
            }`}
          >
            <IconComponent className="w-3 h-3 mr-1" />
            {action.text}
          </Button>
        );
      })}
    </div>
  );
};

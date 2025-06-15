
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Brain, Atom, Search, BarChart3, Beaker } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  disabled?: boolean;
  enhanced?: boolean;
}

export const QuickActions = ({ onActionClick, disabled = false, enhanced = false }: QuickActionsProps) => {
  const { t } = useLanguage();

  const basicActions = [
    { 
      key: 'quick.grover_algorithm', 
      icon: Search, 
      variant: 'secondary' as const
    },
    { 
      key: 'quick.quantum_cryptography', 
      icon: Atom, 
      variant: 'secondary' as const 
    },
    { 
      key: 'quick.latest_quantum_news', 
      icon: Zap, 
      variant: 'outline' as const 
    }
  ];

  const enhancedActions = [
    { 
      key: 'quick.quantum_vs_classical', 
      icon: Brain, 
      variant: 'secondary' as const 
    },
    { 
      key: 'quick.system_status', 
      icon: BarChart3, 
      variant: 'outline' as const 
    },
    { 
      key: 'quick.vqe_chemistry', 
      icon: Beaker, 
      variant: 'secondary' as const 
    }
  ];

  const actions = enhanced ? [...basicActions, ...enhancedActions] : basicActions;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-gray-400 font-medium">Quick Actions:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {actions.map(({ key, icon: Icon, variant }) => (
          <Button
            key={key}
            variant={variant}
            size="sm"
            onClick={() => onActionClick(t(key))}
            disabled={disabled}
            className="h-auto p-3 text-xs hover:scale-105 transition-all duration-200 bg-white/5 hover:bg-white/10 border-white/20"
          >
            <div className="flex items-center gap-2 text-left">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t(key)}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

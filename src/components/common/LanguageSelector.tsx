
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

const languageOptions: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'ro', label: 'Română', flag: '🇷🇴' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' }
];

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
          <SelectValue placeholder={t('language.select')} />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          {languageOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-white hover:bg-gray-800 focus:bg-gray-800"
            >
              <span className="flex items-center gap-2">
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

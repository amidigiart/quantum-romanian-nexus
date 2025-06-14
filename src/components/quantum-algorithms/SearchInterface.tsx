
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchInterfaceProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onExecuteSearch: () => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  searchQuery,
  onSearchQueryChange,
  onExecuteSearch
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Introduceți parametrii pentru căutarea Grover..."
          className="bg-white/20 border-white/30 text-white placeholder-gray-300"
        />
        <Button
          onClick={onExecuteSearch}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

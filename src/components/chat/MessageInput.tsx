
import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = React.memo<MessageInputProps>(({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Întrebați despre quantum computing..."
}) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && value.trim()) {
      onSend();
    }
  }, [onSend, disabled, value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="flex gap-2 mb-4">
      <Input
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:ring-cyan-400"
        disabled={disabled}
      />
      <Button 
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

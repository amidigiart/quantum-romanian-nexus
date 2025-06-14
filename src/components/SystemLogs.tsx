
import React from 'react';
import { Card } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface SystemLog {
  time: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface SystemLogsProps {
  logs: SystemLog[];
}

export const SystemLogs = ({ logs }: SystemLogsProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-6 h-6 text-gray-400" />
        <h3 className="text-2xl font-bold text-white">Jurnal Sistem</h3>
      </div>
      <div className="bg-black/50 rounded-lg p-4 h-32 overflow-y-auto">
        <div className="font-mono text-sm space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`${
                log.type === 'success' ? 'text-green-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                log.type === 'error' ? 'text-red-400' :
                'text-blue-400'
              }`}
            >
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

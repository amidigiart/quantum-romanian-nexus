
import React from 'react';
import { Card } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

export const ConnectivityStatus = () => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-bold text-white">Conectivitate IoT</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Gateway Principal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Senzori Ambientali</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Senzori Industriali</span>
        </div>
      </div>
    </Card>
  );
};

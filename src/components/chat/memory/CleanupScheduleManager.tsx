
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Edit, Play, Pause } from 'lucide-react';
import { cleanupScheduler, CleanupJob, CleanupScheduleConfig } from '@/services/cache/cleanupScheduler';

interface CleanupScheduleManagerProps {
  onScheduleChange?: (schedules: CleanupJob[]) => void;
  cleanupCallback: () => Promise<number>;
}

export const CleanupScheduleManager: React.FC<CleanupScheduleManagerProps> = ({
  onScheduleChange,
  cleanupCallback
}) => {
  const [schedules, setSchedules] = useState<CleanupJob[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CleanupJob | null>(null);

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    interval: 24, // hours
    maxAge: 30, // days
    triggerMemoryThreshold: 80,
    triggerMessageCount: 1000,
    triggerConversationCount: 100,
    enabled: true,
    enableGCAfterCleanup: true
  });

  useEffect(() => {
    updateSchedulesList();
  }, []);

  const updateSchedulesList = () => {
    const allSchedules = cleanupScheduler.getAllSchedules();
    setSchedules(allSchedules);
    onScheduleChange?.(allSchedules);
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.name.trim()) return;

    const config: Partial<CleanupScheduleConfig> = {
      enabled: newSchedule.enabled,
      interval: newSchedule.interval * 60 * 60 * 1000, // convert hours to ms
      maxAge: newSchedule.maxAge,
      triggerMemoryThreshold: newSchedule.triggerMemoryThreshold,
      triggerMessageCount: newSchedule.triggerMessageCount,
      triggerConversationCount: newSchedule.triggerConversationCount,
      enableGCAfterCleanup: newSchedule.enableGCAfterCleanup
    };

    const id = `schedule-${Date.now()}`;
    cleanupScheduler.createSchedule(id, newSchedule.name, config, cleanupCallback);

    setNewSchedule({
      name: '',
      interval: 24,
      maxAge: 30,
      triggerMemoryThreshold: 80,
      triggerMessageCount: 1000,
      triggerConversationCount: 100,
      enabled: true,
      enableGCAfterCleanup: true
    });
    setShowCreateForm(false);
    updateSchedulesList();
  };

  const handleToggleSchedule = (id: string, enabled: boolean) => {
    cleanupScheduler.updateSchedule(id, { enabled });
    updateSchedulesList();
  };

  const handleDeleteSchedule = (id: string) => {
    cleanupScheduler.deleteSchedule(id);
    updateSchedulesList();
  };

  const formatInterval = (ms: number) => {
    const hours = ms / (1000 * 60 * 60);
    if (hours < 24) return `${hours}h`;
    const days = hours / 24;
    return `${days}d`;
  };

  const formatNextRun = (nextRun: Date | null) => {
    if (!nextRun) return 'Disabled';
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Cleanup Schedules</h3>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="outline"
          size="sm"
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-white/5 border-white/10 p-4 space-y-3">
          <h4 className="text-md font-medium text-white">Create New Schedule</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Name</Label>
              <Input
                value={newSchedule.name}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Daily cleanup"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Interval (hours)</Label>
              <Input
                type="number"
                value={newSchedule.interval}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, interval: parseInt(e.target.value) || 24 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Max Age (days)</Label>
              <Input
                type="number"
                value={newSchedule.maxAge}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 30 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Memory Threshold (%)</Label>
              <Input
                type="number"
                value={newSchedule.triggerMemoryThreshold}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, triggerMemoryThreshold: parseInt(e.target.value) || 80 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newSchedule.enabled}
                onCheckedChange={(enabled) => setNewSchedule(prev => ({ ...prev, enabled }))}
              />
              <Label className="text-gray-300">Enabled</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newSchedule.enableGCAfterCleanup}
                onCheckedChange={(enableGCAfterCleanup) => setNewSchedule(prev => ({ ...prev, enableGCAfterCleanup }))}
              />
              <Label className="text-gray-300">Run GC after cleanup</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateSchedule} size="sm">
              Create Schedule
            </Button>
            <Button 
              onClick={() => setShowCreateForm(false)} 
              variant="outline" 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="bg-white/5 border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {schedule.isRunning ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${schedule.config.enabled ? 'bg-blue-400' : 'bg-gray-400'}`} />
                  )}
                  <span className="text-white font-medium">{schedule.name}</span>
                </div>
                
                <Badge variant={schedule.config.enabled ? "default" : "secondary"}>
                  {schedule.config.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleToggleSchedule(schedule.id, !schedule.config.enabled)}
                  variant="ghost"
                  size="sm"
                >
                  {schedule.config.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Interval: {formatInterval(schedule.config.interval)}</span>
                <span>Max Age: {schedule.config.maxAge} days</span>
              </div>
              <div className="flex justify-between">
                <span>Next Run: {formatNextRun(schedule.nextRun)}</span>
                <span>Last Run: {schedule.lastRun ? schedule.lastRun.toLocaleTimeString() : 'Never'}</span>
              </div>
            </div>
          </Card>
        ))}

        {schedules.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No cleanup schedules configured
          </div>
        )}
      </div>
    </Card>
  );
};

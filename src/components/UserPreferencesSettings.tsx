
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Atom, Shield, Brain, Microchip, Bell } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const UserPreferencesSettings = () => {
  const { preferences, loading, savePreferences } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);

  const handlePreferenceChange = (key: string, value: any) => {
    savePreferences({ [key]: value });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newNotifications = { ...preferences.notification_settings, [key]: value };
    savePreferences({ notification_settings: newNotifications });
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-white">Se încarcă preferințele...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Preferințe Cuantice</h2>
        </div>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
        >
          {isOpen ? 'Ascunde' : 'Afișează'}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Quantum Algorithm Preference */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-green-400" />
              <Label className="text-white">Algoritm Cuantic Preferat</Label>
            </div>
            <Select
              value={preferences.quantum_algorithm_preference}
              onValueChange={(value) => handlePreferenceChange('quantum_algorithm_preference', value)}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grover">Grover (Căutare)</SelectItem>
                <SelectItem value="shor">Shor (Factorizare)</SelectItem>
                <SelectItem value="qaoa">QAOA (Optimizare)</SelectItem>
                <SelectItem value="vqe">VQE (Energie)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Qubit Count */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Microchip className="w-4 h-4 text-blue-400" />
              <Label className="text-white">Număr Preferat de Qubits</Label>
              <Badge variant="outline" className="border-blue-400 text-blue-400">
                {preferences.preferred_qubit_count}
              </Badge>
            </div>
            <Slider
              value={[preferences.preferred_qubit_count]}
              onValueChange={(value) => handlePreferenceChange('preferred_qubit_count', value[0])}
              max={16}
              min={4}
              step={1}
              className="w-full"
            />
          </div>

          {/* Quantum Simulation Mode */}
          <div className="space-y-2">
            <Label className="text-white">Mod Simulare Cuantică</Label>
            <Select
              value={preferences.quantum_simulation_mode}
              onValueChange={(value) => handlePreferenceChange('quantum_simulation_mode', value)}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="accelerated">Accelerat</SelectItem>
                <SelectItem value="precise">Precis</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Encryption Protocol */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <Label className="text-white">Protocol Criptografie</Label>
            </div>
            <Select
              value={preferences.encryption_protocol}
              onValueChange={(value) => handlePreferenceChange('encryption_protocol', value)}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bb84">BB84</SelectItem>
                <SelectItem value="e91">E91</SelectItem>
                <SelectItem value="sarg04">SARG04</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ML Model Preference */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <Label className="text-white">Model ML Cuantic</Label>
            </div>
            <Select
              value={preferences.ml_model_preference}
              onValueChange={(value) => handlePreferenceChange('ml_model_preference', value)}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qnn">Quantum Neural Network</SelectItem>
                <SelectItem value="qsvm">Quantum SVM</SelectItem>
                <SelectItem value="qgan">Quantum GAN</SelectItem>
                <SelectItem value="vqc">Variational Quantum Classifier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              <Label className="text-white">Setări Notificări</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Notificări Chat</span>
              <Switch
                checked={preferences.notification_settings.chat_notifications}
                onCheckedChange={(checked) => handleNotificationChange('chat_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Alerte Sistem</span>
              <Switch
                checked={preferences.notification_settings.system_alerts}
                onCheckedChange={(checked) => handleNotificationChange('system_alerts', checked)}
              />
            </div>
          </div>

          {/* Theme Preference */}
          <div className="space-y-2">
            <Label className="text-white">Temă Interfață</Label>
            <Select
              value={preferences.theme_preference}
              onValueChange={(value) => handlePreferenceChange('theme_preference', value)}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantum">Quantum (Implicit)</SelectItem>
                <SelectItem value="dark">Întunecat</SelectItem>
                <SelectItem value="light">Luminos</SelectItem>
                <SelectItem value="cyber">Cyber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
};

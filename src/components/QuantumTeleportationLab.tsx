
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Network, Radio } from 'lucide-react';
import { LongDistanceQuantumTeleportation } from '@/components/quantum-algorithms/LongDistanceQuantumTeleportation';

export const QuantumTeleportationLab = () => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-purple-400" />
          <CardTitle className="text-white">Laborator Teleportare Cuantică</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="longdistance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="longdistance">Lungă Distanță</TabsTrigger>
            <TabsTrigger value="protocols">Protocoale Avansate</TabsTrigger>
            <TabsTrigger value="theory">Teorie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="longdistance" className="mt-6">
            <LongDistanceQuantumTeleportation />
          </TabsContent>
          
          <TabsContent value="protocols" className="mt-6">
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Protocoale Experimentale</h4>
                <p className="text-gray-300 text-sm">
                  Explorează protocoale avansate de teleportare cuantică în dezvoltare.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="theory" className="mt-6">
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Fundamentele Teoretice</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Teleportarea cuantică se bazează pe principiul că informația cuantică poate fi transmisă 
                  între două locații folosind entanglement-ul cuantic și comunicarea clasică.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                  <li>Teorema no-cloning împiedică copierea perfectă a stărilor cuantice</li>
                  <li>Entanglement-ul cuantic permite corelații non-locale</li>
                  <li>Măsurătorile Bell permit transferul informației cuantice</li>
                  <li>Comunicarea clasică este necesară pentru completarea procesului</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

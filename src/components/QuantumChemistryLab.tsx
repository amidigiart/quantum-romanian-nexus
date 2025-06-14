
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Atom, 
  Flask, 
  Zap, 
  Calculator, 
  RotateCcw, 
  Play, 
  Pause, 
  Download,
  Microscope,
  Orbit,
  Beaker
} from 'lucide-react';

interface Molecule {
  name: string;
  formula: string;
  atoms: number;
  bonds: number;
  geometry: string;
  energy: number;
  dipole: number;
}

interface SimulationResult {
  energy: number;
  geometry: string;
  vibrations: number[];
  orbitals: string[];
  properties: {
    dipole: number;
    polarizability: number;
    homo: number;
    lumo: number;
  };
}

export const QuantumChemistryLab = () => {
  const [selectedMolecule, setSelectedMolecule] = useState<string>('water');
  const [calculationType, setCalculationType] = useState<string>('dft');
  const [basisSet, setBasisSet] = useState<string>('6-31G');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [currentMolecule, setCurrentMolecule] = useState<Molecule | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [vibrationMode, setVibrationMode] = useState(0);

  const molecules = [
    {
      id: 'water',
      name: 'Apă (H₂O)',
      formula: 'H₂O',
      atoms: 3,
      bonds: 2,
      geometry: 'Bent',
      energy: -76.4,
      dipole: 1.85
    },
    {
      id: 'methane',
      name: 'Metan (CH₄)',
      formula: 'CH₄',
      atoms: 5,
      bonds: 4,
      geometry: 'Tetrahedral',
      energy: -40.5,
      dipole: 0.0
    },
    {
      id: 'benzene',
      name: 'Benzen (C₆H₆)',
      formula: 'C₆H₆',
      atoms: 12,
      bonds: 12,
      geometry: 'Planar',
      energy: -232.3,
      dipole: 0.0
    },
    {
      id: 'caffeine',
      name: 'Cofeină (C₈H₁₀N₄O₂)',
      formula: 'C₈H₁₀N₄O₂',
      atoms: 24,
      bonds: 25,
      geometry: 'Complex',
      energy: -567.8,
      dipole: 3.64
    },
    {
      id: 'dna_base',
      name: 'Adenină (C₅H₅N₅)',
      formula: 'C₅H₅N₅',
      atoms: 15,
      bonds: 16,
      geometry: 'Planar',
      energy: -432.1,
      dipole: 2.38
    }
  ];

  const calculationMethods = [
    { id: 'hf', name: 'Hartree-Fock', description: 'Metoda de bază pentru calcule cuantice' },
    { id: 'dft', name: 'DFT (B3LYP)', description: 'Teoria funcționalei densității' },
    { id: 'mp2', name: 'MP2', description: 'Perturbația Møller-Plesset de ordinul 2' },
    { id: 'ccsd', name: 'CCSD(T)', description: 'Coupled Cluster cu single și double excitații' }
  ];

  const basisSets = [
    '3-21G', '6-31G', '6-31G*', '6-31G**', '6-311G*', 'cc-pVDZ', 'cc-pVTZ'
  ];

  useEffect(() => {
    const molecule = molecules.find(m => m.id === selectedMolecule);
    if (molecule) {
      setCurrentMolecule(molecule);
    }
  }, [selectedMolecule]);

  const startSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationResult(null);

    const simulationInterval = setInterval(() => {
      setSimulationProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 2;
        
        if (newProgress >= 100) {
          clearInterval(simulationInterval);
          setIsSimulating(false);
          
          // Generate simulation results
          const result: SimulationResult = {
            energy: -Math.random() * 500 - 50,
            geometry: 'Optimized',
            vibrations: Array.from({length: 6}, () => Math.random() * 3000 + 500),
            orbitals: ['HOMO', 'LUMO', 'HOMO-1', 'LUMO+1'],
            properties: {
              dipole: Math.random() * 5,
              polarizability: Math.random() * 50 + 10,
              homo: -Math.random() * 10 - 5,
              lumo: Math.random() * 5 + 2
            }
          };
          
          setSimulationResult(result);
          return 100;
        }
        
        return newProgress;
      });
    }, 200);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setSimulationResult(null);
  };

  const renderMolecularVisualization = () => {
    if (!currentMolecule) return null;

    // Simple ASCII-style molecular representation
    const molecularStructures = {
      water: `
        H
         \\
          O
         /
        H
      `,
      methane: `
        H
        |
    H—C—H
        |
        H
      `,
      benzene: `
      H   H
       \\ /
        C
       / \\
    H-C   C-H
      ||  ||
    H-C   C-H
       \\ /
        C
       / \\
      H   H
      `,
      caffeine: `
    Complex heterocyclic
    structure with
    purine rings
      `,
      dna_base: `
    Purine base
    with amino
    groups
      `
    };

    return (
      <div className="bg-black/40 rounded-lg p-6 text-center">
        <div className="text-cyan-400 font-mono text-lg mb-4">
          Structura Moleculară: {currentMolecule.name}
        </div>
        <pre className="text-green-400 font-mono text-sm whitespace-pre">
          {molecularStructures[selectedMolecule as keyof typeof molecularStructures]}
        </pre>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded p-2">
            <div className="text-gray-400">Atomi</div>
            <div className="text-white font-bold">{currentMolecule.atoms}</div>
          </div>
          <div className="bg-white/10 rounded p-2">
            <div className="text-gray-400">Legături</div>
            <div className="text-white font-bold">{currentMolecule.bonds}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="w-6 h-6 text-cyan-400" />
            <CardTitle className="text-white">Laborator de Chimie Cuantică</CardTitle>
          </div>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            Simulare Moleculară
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="setup" className="data-[state=active]:bg-cyan-500/20">
              Setup
            </TabsTrigger>
            <TabsTrigger value="visualize" className="data-[state=active]:bg-cyan-500/20">
              Vizualizare
            </TabsTrigger>
            <TabsTrigger value="simulate" className="data-[state=active]:bg-cyan-500/20">
              Simulare
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-cyan-500/20">
              Rezultate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-6">
            <div className="space-y-6">
              <div>
                <label className="text-white font-medium mb-2 block">Selectează Molecula:</label>
                <Select value={selectedMolecule} onValueChange={setSelectedMolecule}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {molecules.map((molecule) => (
                      <SelectItem key={molecule.id} value={molecule.id}>
                        {molecule.name} ({molecule.formula})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Metoda de Calcul:</label>
                <Select value={calculationType} onValueChange={setCalculationType}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} - {method.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Set de Bază:</label>
                <Select value={basisSet} onValueChange={setBasisSet}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {basisSets.map((basis) => (
                      <SelectItem key={basis} value={basis}>
                        {basis}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentMolecule && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Proprietăți Moleculare:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Geometrie:</span>
                      <span className="text-white ml-2">{currentMolecule.geometry}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Moment Dipolar:</span>
                      <span className="text-white ml-2">{currentMolecule.dipole} D</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Energie Estimată:</span>
                      <span className="text-white ml-2">{currentMolecule.energy} Hartree</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Număr Atomi:</span>
                      <span className="text-white ml-2">{currentMolecule.atoms}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="visualize" className="mt-6">
            {renderMolecularVisualization()}
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Orbit className="w-4 h-4 mr-2" />
                Rotește
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Microscope className="w-4 h-4 mr-2" />
                Zoom
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="simulate" className="mt-6">
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Configurația Simulării:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Moleculă:</span>
                    <span className="text-cyan-400 ml-2">{currentMolecule?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Metodă:</span>
                    <span className="text-cyan-400 ml-2">{calculationType.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Set de Bază:</span>
                    <span className="text-cyan-400 ml-2">{basisSet}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 ml-2">
                      {isSimulating ? 'În progres' : 'Pregătit'}
                    </span>
                  </div>
                </div>
              </div>

              {simulationProgress > 0 && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Progres Simulare:</span>
                    <span className="text-cyan-400">{simulationProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${simulationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Simulare în curs...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Pornește Simularea
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {simulationResult ? (
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-green-400" />
                    Rezultate Calcul Cuantic
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-gray-400 text-sm">Energie Totală</div>
                      <div className="text-green-400 font-bold text-lg">
                        {simulationResult.energy.toFixed(6)} Hartree
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-gray-400 text-sm">Geometrie</div>
                      <div className="text-cyan-400 font-bold">
                        {simulationResult.geometry}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Proprietăți Moleculare:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Moment Dipolar:</span>
                      <span className="text-white ml-2">
                        {simulationResult.properties.dipole.toFixed(3)} D
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Polarizabilitate:</span>
                      <span className="text-white ml-2">
                        {simulationResult.properties.polarizability.toFixed(2)} Ų
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">HOMO:</span>
                      <span className="text-red-400 ml-2">
                        {simulationResult.properties.homo.toFixed(3)} eV
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">LUMO:</span>
                      <span className="text-blue-400 ml-2">
                        {simulationResult.properties.lumo.toFixed(3)} eV
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Frecvențe Vibraționale:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {simulationResult.vibrations.map((freq, index) => (
                      <div key={index} className="bg-black/30 rounded p-2 text-center">
                        <div className="text-yellow-400 font-mono">
                          {freq.toFixed(0)} cm⁻¹
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Atom className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  Rulează o simulare pentru a vedea rezultatele...
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


export const generateAlgorithmResult = (algorithmId: string) => {
  const resultMap: Record<string, string> = {
    grover: `Element găsit la poziția ${Math.floor(Math.random() * 1000)} din ${Math.floor(Math.random() * 10000)} elemente`,
    shor: `Factorii pentru N=${Math.floor(Math.random() * 1000 + 100)}: ${Math.floor(Math.random() * 50 + 2)} × ${Math.floor(Math.random() * 50 + 2)}`,
    qaoa: `Soluție optimă găsită: Cost = ${(Math.random() * 100).toFixed(2)}, Probabilitate = ${(Math.random() * 0.9 + 0.1).toFixed(3)}`,
    vqe: `Energia stării fundamentale: ${(-Math.random() * 10 - 5).toFixed(4)} Hartree`,
    qml: `Model antrenat cu acuratețea ${(Math.random() * 0.15 + 0.85).toFixed(3)}, Loss: ${(Math.random() * 0.1).toFixed(4)}`,
    qrng: `Secvență generată: ${Array.from({length: 16}, () => Math.floor(Math.random() * 2)).join('')}`,
    qft: `Transformată calculată pentru ${Math.floor(Math.random() * 8 + 4)} qubits, Amplitudine maximă: ${(Math.random()).toFixed(4)}`,
    qec: `Erori detectate și corectate: ${Math.floor(Math.random() * 5)} din ${Math.floor(Math.random() * 20 + 10)} qubits`,
    qsim: `Simulare completă pentru ${Math.floor(Math.random() * 6 + 8)} particule, Timp evolut: ${(Math.random() * 10).toFixed(2)} ns`,
    qopt: `Portofoliu optimizat: Return expected ${(Math.random() * 0.1 + 0.05).toFixed(3)}, Risk ${(Math.random() * 0.05 + 0.01).toFixed(3)}`
  };
  
  return { result: resultMap[algorithmId] || 'Rezultat generat cu succes' };
};

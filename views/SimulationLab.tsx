import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { simulateLifestyleChange } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { Play, RotateCcw, Microscope } from 'lucide-react';

export const SimulationLab = () => {
  const { activePatient, patients } = useApp();
  // If no active patient, use the first one or the user themselves in patient mode
  const targetPatient = activePatient || patients[0];

  const [weightChange, setWeightChange] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [quitSmoking, setQuitSmoking] = useState(false);
  const [medAdherence, setMedAdherence] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const runSimulation = async () => {
    if (!targetPatient) return;
    setIsSimulating(true);
    const res = await simulateLifestyleChange(targetPatient, {
      weightChange,
      exerciseMinutes,
      quitSmoking,
      medicationAdherence: medAdherence
    });
    setResult(res);
    setIsSimulating(false);
  };

  const reset = () => {
    setWeightChange(0);
    setExerciseMinutes(30);
    setQuitSmoking(false);
    setMedAdherence(100);
    setResult(null);
  };

  if (!targetPatient) return <div>Please select a patient first.</div>;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulation Lab</h1>
        <p className="text-slate-600">Use AI to predict how lifestyle changes impact cardiovascular risk for <span className="font-semibold">{targetPatient.name}</span>.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Adjust Parameters">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weight Change (kg)
                </label>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  value={weightChange} 
                  onChange={(e) => setWeightChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>-20kg</span>
                  <span className="font-bold text-blue-600">{weightChange > 0 ? '+' : ''}{weightChange} kg</span>
                  <span>+20kg</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weekly Exercise (mins)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  step="10"
                  value={exerciseMinutes} 
                  onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="text-right text-sm font-bold text-green-600 mt-1">{exerciseMinutes} mins</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Medication Adherence
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={medAdherence} 
                  onChange={(e) => setMedAdherence(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="text-right text-sm font-bold text-purple-600 mt-1">{medAdherence}%</div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700">Quit Smoking?</span>
                <button 
                  onClick={() => setQuitSmoking(!quitSmoking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${quitSmoking ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quitSmoking ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <Button onClick={runSimulation} isLoading={isSimulating} className="flex-1">
                  <Play className="w-4 h-4 mr-2" /> Run Sim
                </Button>
                <Button onClick={reset} variant="secondary">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {result ? (
            <Card className="h-full border-blue-100 bg-gradient-to-br from-white to-blue-50/50">
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Projected Future</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Current Risk</p>
                    <div className="text-3xl font-bold text-slate-700">{targetPatient.riskScore}%</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-blue-100 ring-2 ring-blue-500/10">
                    <p className="text-sm text-blue-600 mb-1 font-medium">Projected Risk</p>
                    <div className="text-4xl font-bold text-blue-600">{result.riskScore}%</div>
                    <span className={`text-sm font-medium ${result.riskScore < targetPatient.riskScore ? 'text-green-500' : 'text-red-500'}`}>
                      {result.riskScore < targetPatient.riskScore ? '▼ Risk Reduced' : '▲ Risk Increased'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Outcome Analysis</h4>
                    <p className="text-slate-600 leading-relaxed">{result.simulationOutcome}</p>
                  </div>
                  
                  {result.recommendations && result.recommendations.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Key Actions</h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-600">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                     </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <Microscope className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">Adjust parameters and run simulation</p>
              <p className="text-sm mt-1">AI will predict physiological impact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
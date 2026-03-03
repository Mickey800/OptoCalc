import React, { useState, useEffect } from 'react';
import { Calculator, Info, RotateCcw, ChevronRight, Eye, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type PhoriaType = 'Eso' | 'Exo' | 'Ortho';

interface PhoriaValue {
  magnitude: number;
  type: PhoriaType;
}

export default function App() {
  // State for inputs
  const [distPhoria, setDistPhoria] = useState<PhoriaValue>({ magnitude: 0, type: 'Ortho' });
  const [nearPhoria, setNearPhoria] = useState<PhoriaValue>({ magnitude: 0, type: 'Ortho' });
  const [nearPhoriaWithLens, setNearPhoriaWithLens] = useState<PhoriaValue>({ magnitude: 0, type: 'Ortho' });
  const [lensPower, setLensPower] = useState<number>(1.0);
  const [ipd, setIpd] = useState<number>(6.0); // in cm
  const [nearDistance, setNearDistance] = useState<number>(0.4); // in meters (40cm)

  // Results
  const [gradientAca, setGradientAca] = useState<number | null>(null);
  const [calculatedAca, setCalculatedAca] = useState<number | null>(null);

  const getSignedPhoria = (p: PhoriaValue) => {
    if (p.type === 'Ortho') return 0;
    return p.type === 'Eso' ? p.magnitude : -p.magnitude;
  };

  const calculateResults = () => {
    const pDist = getSignedPhoria(distPhoria);
    const pNear = getSignedPhoria(nearPhoria);
    const pNearLens = getSignedPhoria(nearPhoriaWithLens);

    // Gradient AC/A
    // Formula: |(Phoria with lens - Phoria without lens) / Lens Power|
    // We use absolute difference because the ratio is a magnitude of change
    const grad = Math.abs((pNearLens - pNear) / (lensPower || 1));
    setGradientAca(Number(grad.toFixed(2)));

    // Calculated AC/A
    // Formula: IPD + (NearPhoria - DistPhoria) / AccommAtNear
    const accommodation = 1 / (nearDistance || 0.4);
    const calc = ipd + (pNear - pDist) / accommodation;
    setCalculatedAca(Number(calc.toFixed(2)));
  };

  useEffect(() => {
    calculateResults();
  }, [distPhoria, nearPhoria, nearPhoriaWithLens, lensPower, ipd, nearDistance]);

  const reset = () => {
    setDistPhoria({ magnitude: 0, type: 'Ortho' });
    setNearPhoria({ magnitude: 0, type: 'Ortho' });
    setNearPhoriaWithLens({ magnitude: 0, type: 'Ortho' });
    setLensPower(1.0);
    setIpd(6.0);
    setNearDistance(0.4);
  };

  const getInterpretation = (val: number) => {
    if (val < 3) return { text: 'Low AC/A', color: 'text-blue-600', desc: 'Patient may have Convergence Insufficiency or Divergence Excess.' };
    if (val > 5) return { text: 'High AC/A', color: 'text-red-600', desc: 'Patient may have Convergence Excess or Divergence Insufficiency.' };
    return { text: 'Normal AC/A', color: 'text-emerald-600', desc: 'Within the typical range of 3:1 to 5:1.' };
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Activity size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Clinical Tool</span>
            </div>
            <h1 className="text-4xl font-light tracking-tight text-slate-800">
              AC/A <span className="font-semibold">Ratio</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Accommodative Convergence to Accommodation Ratio Calculator</p>
          </div>
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm w-fit"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Distance Phoria */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Eye size={18} />
                </div>
                <h2 className="font-semibold text-slate-800">Distance Phoria</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Magnitude (Δ)</label>
                  <input 
                    type="number" 
                    value={distPhoria.magnitude || ''} 
                    onChange={(e) => setDistPhoria({ ...distPhoria, magnitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Type</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    {(['Exo', 'Ortho', 'Eso'] as PhoriaType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setDistPhoria({ ...distPhoria, type: t })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          distPhoria.type === t 
                            ? 'bg-white text-emerald-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Near Phoria */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Calculator size={18} />
                </div>
                <h2 className="font-semibold text-slate-800">Near Phoria (40cm)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Baseline Magnitude (Δ)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        value={nearPhoria.magnitude || ''} 
                        onChange={(e) => setNearPhoria({ ...nearPhoria, magnitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        placeholder="0"
                      />
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                        {(['Exo', 'Ortho', 'Eso'] as PhoriaType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setNearPhoria({ ...nearPhoria, type: t })}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              nearPhoria.type === t 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">With Added Lens (Δ)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        value={nearPhoriaWithLens.magnitude || ''} 
                        onChange={(e) => setNearPhoriaWithLens({ ...nearPhoriaWithLens, magnitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        placeholder="0"
                      />
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                        {(['Exo', 'Ortho', 'Eso'] as PhoriaType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setNearPhoriaWithLens({ ...nearPhoriaWithLens, type: t })}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              nearPhoriaWithLens.type === t 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Lens Power (D)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="-3" 
                        max="3" 
                        step="0.25"
                        value={lensPower}
                        onChange={(e) => setLensPower(parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500"
                      />
                      <span className="w-16 text-center font-mono font-bold text-emerald-600 bg-emerald-50 py-1 rounded-lg border border-emerald-100">
                        {lensPower > 0 ? `+${lensPower.toFixed(2)}` : lensPower.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Usually +1.00D or -1.00D is used for Gradient method.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">IPD (cm)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="5" 
                        max="8" 
                        step="0.1"
                        value={ipd}
                        onChange={(e) => setIpd(parseFloat(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <span className="w-16 text-center font-mono font-bold text-indigo-600 bg-indigo-50 py-1 rounded-lg border border-indigo-100">
                        {ipd.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Analysis Results</span>
                </div>

                <div className="space-y-10">
                  {/* Gradient Result */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gradient AC/A</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Info size={10} />
                        <span>Near method</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-light tracking-tighter">
                        {gradientAca !== null ? gradientAca : '--'}
                      </span>
                      <span className="text-xl font-medium text-emerald-500">: 1</span>
                    </div>
                    {gradientAca !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 text-xs font-semibold ${getInterpretation(gradientAca).color}`}
                      >
                        {getInterpretation(gradientAca).text}
                      </motion.div>
                    )}
                  </div>

                  {/* Calculated Result */}
                  <div className="pt-8 border-t border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Calculated AC/A</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Info size={10} />
                        <span>Dist/Near method</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-light tracking-tighter text-slate-300">
                        {calculatedAca !== null ? calculatedAca : '--'}
                      </span>
                      <span className="text-lg font-medium text-slate-500">: 1</span>
                    </div>
                    {calculatedAca !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 text-[10px] font-medium ${getInterpretation(calculatedAca).color} opacity-80`}
                      >
                        {getInterpretation(calculatedAca).text}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation Card */}
            <AnimatePresence mode="wait">
              {gradientAca !== null && (
                <motion.div
                  key={gradientAca}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <ChevronRight size={16} className="text-emerald-500" />
                    Clinical Interpretation
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {getInterpretation(gradientAca).desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Normal Range</span>
                    <span className="font-bold text-slate-600">3:1 — 5:1</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <p className="text-[10px] text-indigo-700 leading-relaxed">
                <strong>Note:</strong> Gradient AC/A is generally more reliable as it eliminates the proximal convergence factor by keeping the distance constant.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Michael Baah-Achamfour
          </p>
        </footer>
      </div>
    </div>
  );
}

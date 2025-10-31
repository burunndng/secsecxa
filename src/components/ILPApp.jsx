import React, { useState } from 'react';
import { CheckCircle2, Circle, Menu, X } from 'lucide-react';

export default function ILPApp() {
  const [activeTab, setActiveTab] = useState('browse');
  const [practiceStack, setPracticeStack] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dailyNotes, setDailyNotes] = useState({});
  const [is321Open, setIs321Open] = useState(false);
  const [step321, setStep321] = useState(1);
  const [session321Data, setSession321Data] = useState({
    trigger: '',
    emotion: '',
    intensity: 5,
    faceIt: '',
    talkToIt: '',
    beIt: '',
    integration: '',
  });
  const [session321History, setSession321History] = useState([]);

  const practices = {
    body: [
      { id: 'sleep', name: 'Sleep Foundation', description: 'Consistent 7-9 hours', why: 'Sleep consolidates learning, processes emotions, repairs tissue', timePerWeek: 0, roi: 'EXTREME', how: ['Aim for 7-9 hours nightly', 'Set consistent wake time', 'Keep room dark & cool', 'Avoid screens 60-90 min before bed'] },
      { id: 'resistance', name: 'Resistance Training', description: '2x per week, 20-30 min', why: 'Builds muscle & bone density for longevity', timePerWeek: 1, roi: 'VERY HIGH', how: ['2x per week full-body', 'Focus on compound movements', '1-2 sets per exercise', 'Progress by adding weight'] },
      { id: 'zone2-cardio', name: 'Zone 2 Cardio', description: '3-4x per week, 30-45 min', why: 'Builds aerobic base & mitochondrial health', timePerWeek: 2, roi: 'HIGH', how: ['Pace where you can speak', '3-4 sessions per week', 'Any modality works', 'Should feel sustainable'] },
    ],
    mind: [
      { id: 'deep-learning', name: 'Deep Learning', description: '30-60 min daily', why: 'Protects cognitive health & builds mastery', timePerWeek: 3.5, roi: 'VERY HIGH', how: ['Choose challenging material', 'Set timer for focus', 'Active recall after', 'Focus on one topic'] },
      { id: 'meditation', name: 'Daily Meditation', description: '5-15 min daily', why: 'Core training for attention & emotional regulation', timePerWeek: 1.2, roi: 'EXTREME', how: ['Start with 5-10 min', 'Sit comfortably upright', 'Focus on breath', 'Gently return when mind wanders'] },
    ],
    spirit: [
      { id: 'gratitude', name: 'Gratitude Practice', description: '5 min daily', why: 'Exceptional ROI - rewires attention toward positive', timePerWeek: 0.5, roi: 'EXTREME', how: ['Write 3-5 specific things', 'Be concrete & specific', 'Write WHY it happened'] },
      { id: 'nature', name: 'Nature Exposure', description: '120 min per week', why: 'Reduces stress & restores attention', timePerWeek: 2, roi: 'HIGH', how: ['Accumulate 120 min total', 'Parks, forests, beaches count', 'Can combine with cardio'] },
    ],
    shadow: [
      { id: 'three-two-one', name: '3-2-1 Process', description: '15-20 min journaling', why: 'Make unconscious visible & integrate projections', timePerWeek: 0.5, roi: 'VERY HIGH', how: ['Face It (3rd person)', 'Talk to It (2nd person)', 'Be It (1st person)'] },
    ],
  };

  const starterStacks = {
    green: { name: '🟢 Beginner', practices: ['sleep', 'gratitude', 'zone2-cardio', 'resistance'], description: 'High ROI, minimal time' },
    yellow: { name: '🟡 Intermediate', practices: ['sleep', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'gratitude'], description: 'Adds mental & spiritual depth' },
    red: { name: '🔴 Advanced', practices: ['sleep', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'three-two-one'], description: 'Comprehensive with shadow work' },
  };

  const modules = {
    body: { name: 'Body', color: 'text-green-400' },
    mind: { name: 'Mind', color: 'text-blue-400' },
    spirit: { name: 'Spirit', color: 'text-purple-400' },
    shadow: { name: 'Shadow', color: 'text-amber-400' },
  };

  const allPractices = Object.values(practices).flat();
  const timeCommitment = practiceStack.reduce((sum, p) => sum + p.timePerWeek, 0);
  const completionRate = practiceStack.length > 0 ? Math.round((completedToday.length / practiceStack.length) * 100) : 0;

  const handleAddPractice = (practice) => {
    if (!practiceStack.find(p => p.id === practice.id)) {
      setPracticeStack([...practiceStack, practice]);
    }
  };

  const handleRemovePractice = (id) => {
    setPracticeStack(practiceStack.filter(p => p.id !== id));
  };

  const handleSelectStack = (stackPractices) => {
    const newStack = stackPractices.map(id => allPractices.find(p => p.id === id)).filter(Boolean);
    setPracticeStack(newStack);
  };

  const handleToggleComplete = (id) => {
    setCompletedToday(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave321 = () => {
    setSession321History([...session321History, { ...session321Data, date: new Date().toLocaleString() }]);
    setSession321Data({ trigger: '', emotion: '', intensity: 5, faceIt: '', talkToIt: '', beIt: '', integration: '' });
    setIs321Open(false);
    setStep321(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">ILP</h1>
          <div className="hidden md:flex gap-2">
            {['browse', 'stack', 'tracker', 'shadow'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md transition ${activeTab === tab ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-700 rounded">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-2">
            {['browse', 'stack', 'tracker', 'shadow'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 rounded transition ${activeTab === tab ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        {activeTab === 'browse' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Browse Practices</h2>
            {Object.entries(practices).map(([moduleKey, modulePractices]) => (
              <div key={moduleKey}>
                <h3 className={`text-2xl font-bold mb-4 ${modules[moduleKey].color}`}>{modules[moduleKey].name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modulePractices.map(p => {
                    const isSelected = practiceStack.some(sp => sp.id === p.id);
                    return (
                      <div key={p.id} className={`p-4 rounded-lg border-2 transition cursor-pointer ${isSelected ? 'border-cyan-400 bg-slate-800 ring-2 ring-cyan-400/20' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}`} onClick={() => !isSelected && handleAddPractice(p)}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-100">{p.name}</h4>
                            <p className="text-xs text-slate-400">{p.description}</p>
                          </div>
                          {isSelected && <button onClick={(e) => { e.stopPropagation(); handleRemovePractice(p.id); }} className="text-red-500"><X size={18} /></button>}
                        </div>
                        <div className="flex gap-2 text-xs mb-2">
                          <span className="px-2 py-1 bg-slate-700 rounded">⏱️ {p.timePerWeek}h/wk</span>
                          <span className={`px-2 py-1 rounded font-semibold ${p.roi === 'EXTREME' ? 'bg-green-900' : p.roi === 'VERY HIGH' ? 'bg-blue-900' : 'bg-purple-900'}`}>{p.roi}</span>
                        </div>
                        <p className="text-slate-300 text-sm"><strong>Why:</strong> {p.why}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stack' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Choose Your Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(starterStacks).map(([key, stack]) => (
                <div key={key} className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition cursor-pointer" onClick={() => handleSelectStack(stack.practices)}>
                  <h3 className="text-lg font-bold mb-2">{stack.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{stack.description}</p>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition">Select Stack</button>
                </div>
              ))}
            </div>
            {practiceStack.length > 0 && (
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-bold mb-2">Your Stack ({practiceStack.length})</h3>
                <p className="text-slate-400 mb-4">Weekly commitment: {timeCommitment.toFixed(1)} hours</p>
                <div className="space-y-2">
                  {practiceStack.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                      <span>{p.name}</span>
                      <button onClick={() => handleRemovePractice(p.id)} className="text-red-500 hover:text-red-400">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">Today's Practice</h2>
              <p className="text-slate-300">{completedToday.length} of {practiceStack.length} complete ({completionRate}%)</p>
              <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            {practiceStack.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No practices selected. Go to Browse!</p>
            ) : (
              <div className="space-y-4">
                {practiceStack.map(p => {
                  const isComplete = completedToday.includes(p.id);
                  const noteKey = `${p.id}-today`;
                  return (
                    <div key={p.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-600" onClick={() => handleToggleComplete(p.id)}>
                      <div className="flex items-start gap-3">
                        {isComplete ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} className="text-slate-600" />}
                        <div className="flex-1">
                          <h4 className={`font-bold ${isComplete ? 'line-through text-slate-500' : ''}`}>{p.name}</h4>
                          <p className="text-sm text-slate-400">{p.description}</p>
                          {!isComplete && (
                            <div className="mt-2 text-sm text-slate-300">
                              {p.how.slice(0, 2).map((step, i) => <div key={i}>• {step}</div>)}
                            </div>
                          )}
                        </div>
                      </div>
                      {!isComplete && (
                        <input type="text" value={dailyNotes[noteKey] || ''} onChange={(e) => { e.stopPropagation(); setDailyNotes(prev => ({ ...prev, [noteKey]: e.target.value })); }} onClick={(e) => e.stopPropagation()} placeholder="Today's note..." className="mt-3 w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shadow' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Shadow Work Tools</h2>
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <h3 className="text-2xl font-bold mb-2">3-2-1 Process</h3>
              <p className="text-slate-400 mb-4">A journaling process to integrate projections and disowned parts.</p>
              <button onClick={() => setIs321Open(true)} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-md font-medium transition">Start 3-2-1 Session</button>
              {session321History.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold mb-3">Recent Sessions ({session321History.length})</h4>
                  <div className="space-y-2">
                    {session321History.slice(-3).reverse().map((session, i) => (
                      <div key={i} className="p-3 bg-slate-700/50 rounded border border-slate-600 text-sm">
                        <p className="text-slate-400">{session.date}</p>
                        <p className="font-semibold mt-1">Trigger: {session.trigger}</p>
                        <p className="text-slate-300">Emotion: {session.emotion} ({session.intensity}/10)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {is321Open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">3-2-1 Shadow Work</h2>
              <button onClick={() => { setIs321Open(false); setStep321(1); }} className="text-slate-400 hover:text-slate-300"><X size={24} /></button>
            </div>

            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i <= step321 ? 'bg-amber-500' : 'bg-slate-700'}`} />
              ))}
            </div>

            {step321 === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Step 1: The Trigger</h3>
                <p className="text-slate-400">What person or quality triggered a strong reaction?</p>
                <input type="text" value={session321Data.trigger} onChange={(e) => setSession321Data(prev => ({ ...prev, trigger: e.target.value }))} placeholder="The trigger..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <input type="text" value={session321Data.emotion} onChange={(e) => setSession321Data(prev => ({ ...prev, emotion: e.target.value }))} placeholder="Primary emotion..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Intensity: {session321Data.intensity}/10</label>
                  <input type="range" min="0" max="10" value={session321Data.intensity} onChange={(e) => setSession321Data(prev => ({ ...prev, intensity: parseInt(e.target.value) }))} className="w-full" />
                </div>
              </div>
            )}

            {step321 === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Step 2: Face It (3rd Person)</h3>
                <p className="text-slate-400">Describe using 'he', 'she', 'they', or 'it'. Be objective.</p>
                <textarea value={session321Data.faceIt} onChange={(e) => setSession321Data(prev => ({ ...prev, faceIt: e.target.value }))} placeholder="Describe what bothers you..." rows="5" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
            )}

            {step321 === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Step 3: Talk To It (2nd Person)</h3>
                <p className="text-slate-400">Speak directly. Ask questions. Listen for answers.</p>
                <textarea value={session321Data.talkToIt} onChange={(e) => setSession321Data(prev => ({ ...prev, talkToIt: e.target.value }))} placeholder="'You [quality], what do you fear would happen if you stopped?'..." rows="5" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
            )}

            {step321 === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Step 4: Be It (1st Person)</h3>
                <p className="text-slate-400">Embody the quality. Speak from its perspective.</p>
                <textarea value={session321Data.beIt} onChange={(e) => setSession321Data(prev => ({ ...prev, beIt: e.target.value }))} placeholder="'I am [quality]. I exist to...'..." rows="5" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
            )}

            {step321 === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Step 5: Integration</h3>
                <p className="text-slate-400">What's the gift? How can you integrate this quality this week?</p>
                <textarea value={session321Data.integration} onChange={(e) => setSession321Data(prev => ({ ...prev, integration: e.target.value }))} placeholder="'The gift is... I can integrate by...'..." rows="5" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep321(Math.max(1, step321 - 1))} disabled={step321 === 1} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded font-medium transition">Back</button>
              {step321 < 5 ? (
                <button onClick={() => setStep321(step321 + 1)} className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition">Next</button>
              ) : (
                <button onClick={handleSave321} className="ml-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded font-medium transition">Save & Complete</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

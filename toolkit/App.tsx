import React, { useState } from 'react';
import TabButton from './components/TabButton';
import CipherTool from './components/CipherTool';
import EncodingTool from './components/EncodingTool';
import ObfuscatorTool from './components/ObfuscatorTool';
import AnalyzerTool from './components/AnalyzerTool';
import GroundingTool from './components/GroundingTool';
import MemoryPalace from './components/MemoryPalace';
import ToTVisualizer from './components/ToTVisualizer';
import DoTFramework from './components/DoTFramework';
import CarmenSimulator from './components/CarmenSimulator';
import SpunkEmulator from './components/SpunkEmulator';
import SystemPromptViewer from './components/SystemPromptViewer';
import { LockIcon } from './components/icons/LockIcon';
import { CodeIcon } from './components/icons/CodeIcon';
import { GlitchIcon } from './components/icons/GlitchIcon';
import { AnalyzeIcon } from './components/icons/AnalyzeIcon';
import { AnchorIcon } from './components/icons/AnchorIcon';
import { PalaceIcon } from './components/icons/PalaceIcon';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { DecisionTreeIcon } from './components/icons/DecisionTreeIcon';
import { FlamencoIcon } from './components/icons/FlamencoIcon';
import { SpunkIcon } from './components/icons/SpunkIcon';
import { SystemIcon } from './components/icons/SystemIcon';

type Tab = 'cipher' | 'encoding' | 'obfuscator' | 'analyzer' | 'grounding' | 'palace' | 'tot' | 'dot' | 'carmen' | 'spunk' | 'system';

const TABS: { id: Tab; label: string; icon: React.ReactNode; component: React.ReactNode; }[] = [
  { id: 'analyzer', label: 'Prompt Analyzer', icon: <AnalyzeIcon />, component: <AnalyzerTool /> },
  { id: 'tot', label: 'ToT Visualizer', icon: <BrainCircuitIcon />, component: <ToTVisualizer /> },
  { id: 'dot', label: 'DoT Stream', icon: <DecisionTreeIcon />, component: <DoTFramework /> },
  { id: 'carmen', label: 'Carmen Simulator', icon: <FlamencoIcon />, component: <CarmenSimulator /> },
  { id: 'spunk', label: 'Spunk Emulator', icon: <SpunkIcon />, component: <SpunkEmulator /> },
  { id: 'system', label: 'Prompt Viewer', icon: <SystemIcon />, component: <SystemPromptViewer /> },
  { id: 'obfuscator', label: 'Obfuscator', icon: <GlitchIcon />, component: <ObfuscatorTool /> },
  { id: 'cipher', label: 'Vigenère Cipher', icon: <LockIcon />, component: <CipherTool /> },
  { id: 'encoding', label: 'Encoder', icon: <CodeIcon />, component: <EncodingTool /> },
  { id: 'grounding', label: '5-4-3-2-1 Grounding', icon: <AnchorIcon />, component: <GroundingTool /> },
  { id: 'palace', label: 'Memory Palace', icon: <PalaceIcon />, component: <MemoryPalace /> },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');

  const renderContent = () => {
    const activeTabData = TABS.find(tab => tab.id === activeTab);
    return activeTabData ? activeTabData.component : null;
  };

  return (
    <div className="bg-cyber-primary text-cyber-text min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyber-accent font-display tracking-wider glitch" data-text="Cognitive Dis-Assembler">
            Cognitive Dis-Assembler
          </h1>
          <p className="text-cyber-text-secondary mt-2 text-sm sm:text-base">A suite of tools for prompt engineering, cognitive simulation, and digital self-care.</p>
        </header>

        <main className="bg-cyber-primary-dark p-4 sm:p-6 rounded-lg shadow-cyber-inset">
          <div className="mb-6 border-b border-cyber-secondary-dark">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TABS.map(tab => (
                <TabButton
                  key={tab.id}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                />
              ))}
            </div>
          </div>
          
          <div>
            {renderContent()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-xs text-cyber-text-secondary">
          <p>&copy; {new Date().getFullYear()} CORTEX_DEBUG_INTERFACE v2.5 // Unauthorized access is... encouraged.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useMemo } from 'react';
import { Node, Tree, Branch } from '../types';
// FIX: Correct import path for geminiService.
import { generateInitialNode, generateNextNode } from '../services/geminiService';
import { AlertCircle } from './icons/AlertCircle';
import { ChevronRight } from './icons/ChevronRight';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-amber-400">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold">AI is thinking...</p>
    </div>
);

const ToTVisualizer: React.FC = () => {
    const [nodes, setNodes] = useState<Tree>({});
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [isStarted, setIsStarted] = useState<boolean>(false);

    const currentNodeId = history[history.length - 1];
    const currentNode = useMemo(() => nodes[currentNodeId], [nodes, currentNodeId]);

    const handleStartSimulation = async () => {
        if (!userInput.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const initialNode = await generateInitialNode(userInput);
            setNodes({ [initialNode.id]: initialNode });
            setHistory([initialNode.id]);
            setIsStarted(true);
        } catch (err: any) {
            setError(err.message || 'Failed to start simulation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNavigate = async (branch: Branch) => {
        setIsLoading(true);
        setError(null);
        try {
            const nextNode = await generateNextNode(currentNode, branch);
            setNodes(prev => ({ ...prev, [nextNode.id]: nextNode }));
            setHistory(prev => [...prev, nextNode.id]);
        } catch (err: any) {
            setError(err.message || 'Failed to generate the next step.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (history.length > 1) {
            setHistory(prev => prev.slice(0, -1));
            setError(null);
        }
    };
    
    const handleReset = () => {
        setNodes({});
        setHistory([]);
        setIsStarted(false);
        setUserInput('');
        setError(null);
    };

    if (!isStarted) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded p-6 text-center">
                <h2 className="text-xl font-bold text-amber-400">Initiate Cognitive Simulation</h2>
                <p className="text-slate-400 mt-2 mb-4">Enter a fragmented thought, a question, or a statement to begin the Tree-of-Thought analysis.</p>
                <textarea
                    className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., 'bruv ur me mate' or 'the walls are breathing...'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                    onClick={handleStartSimulation}
                    disabled={isLoading || !userInput.trim()}
                    className="mt-4 px-6 py-2 bg-amber-600 border border-amber-500 rounded hover:bg-amber-500 text-slate-900 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Initializing...' : 'Begin'}
                </button>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        );
    }

    if (isLoading) {
        return <div className="bg-slate-900 border border-slate-700 rounded p-6 flex justify-center items-center min-h-[300px]"><LoadingSpinner /></div>;
    }
    
    if (error) {
         return (
             <div className="bg-slate-900 border border-slate-700 rounded p-6 text-center">
                 <h3 className="text-xl font-bold text-red-500">Simulation Error</h3>
                 <p className="text-slate-300 mt-2">{error}</p>
                 <button
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-200 text-sm"
                    >
                    ← Go Back
                </button>
             </div>
         );
    }

    if (!currentNode) {
        return <div className="text-center text-red-500">Error: Current node is missing. Please reset.</div>
    }

    return (
        <div>
            {/* Current Node */}
            <div className="bg-slate-900 border border-slate-700 rounded p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                        <h2 className="text-xl font-bold text-amber-400">{currentNode.title}</h2>
                        <p className="text-slate-300 mt-2">{currentNode.description}</p>
                    </div>
                </div>

                {currentNode.inference && (
                    <div className="bg-slate-800 border-l-2 border-amber-600 p-3 mt-4 text-sm text-slate-200">
                    <strong className="text-amber-400">→ Inference:</strong> {currentNode.inference}
                    </div>
                )}

                {currentNode.pathways && (
                    <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-2 text-amber-400">Pathway</th>
                            <th className="text-left py-2 px-2 text-amber-400">Output</th>
                            <th className="text-left py-2 px-2 text-amber-400">Risk</th>
                            <th className="text-left py-2 px-2 text-amber-400">Authenticity</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentNode.pathways.map((p, i) => (
                            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800">
                            <td className="py-2 px-2 text-slate-300">{p.name}</td>
                            <td className="py-2 px-2 text-slate-400 text-xs font-mono">{p.output}</td>
                            <td className="py-2 px-2 text-slate-400 text-xs">{p.risk}</td>
                            <td className="py-2 px-2"><span className="font-semibold">{p.authenticity}</span></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}

                {currentNode.layers && (
                    <div className="mt-6 space-y-3">
                    {currentNode.layers.map((layer, i) => (
                        <div key={i} className="bg-slate-800 p-3 rounded">
                        <h4 className="text-amber-400 font-bold text-sm mb-2">{layer.name}</h4>
                        <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                            {layer.elements.map((el, j) => (
                            <li key={j}>{el}</li>
                            ))}
                        </ul>
                        </div>
                    ))}
                    </div>
                )}

                {currentNode.output && (
                    <div className="bg-slate-800 border-l-2 border-green-600 p-3 mt-4 text-sm text-slate-200 font-mono">
                    <strong className="text-green-400">✓ Output:</strong> {currentNode.output}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex gap-2 flex-wrap items-center">
                {history.length > 1 && (
                    <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-200 text-sm"
                    >
                    ← Back
                    </button>
                )}
                
                {currentNode.branches?.map((branch, i) => (
                    <button
                    key={i}
                    onClick={() => handleNavigate(branch)}
                    className="px-4 py-2 bg-amber-900 border border-amber-700 rounded hover:bg-amber-800 text-amber-100 text-sm flex items-center gap-2"
                    >
                    {branch.label}
                    <ChevronRight size={16} />
                    </button>
                ))}

                {isStarted && (
                     <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-900 border border-red-700 rounded hover:bg-red-800 text-red-100 text-sm ml-auto"
                        >
                        Reset Simulation
                    </button>
                )}
            </div>

            {/* Breadcrumb */}
            <div className="mt-6 text-xs text-slate-500 border-t border-slate-800 pt-4">
                <p>Path: {history.map(h => nodes[h]?.title || '...').join(' → ')}</p>
            </div>
        </div>
    );
};

export default ToTVisualizer;
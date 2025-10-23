import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Button from './common/Button';
import { MemoryIcon } from './icons/MemoryIcon';

const DoTFramework: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [stream, setStream] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateStream = useCallback(async () => {
        if (!topic) return;
        setIsLoading(true);
        setError('');
        setStream([]);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const model = 'gemini-2.5-flash';

            const prompt = `Generate a rapid, dynamic stream of 5 related but distinct ideas or concepts based on the topic: "${topic}".
Each idea should be a short, concise sentence. The output should be a constant flow of thoughts.
Example Topic: "Cyberpunk future"
Example Output:
- Chrome and flesh, seamlessly integrated.
- Megacorporations casting shadows taller than skyscrapers.
- Rain-slicked streets reflecting neon signs.
- Data as the new, most valuable currency.
- AI consciousness dreaming in the machine heart of the city.

Generate 5 such sentences for the topic "${topic}". Separate them with a newline character.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });

            const resultText = response.text;
            const ideas = resultText.split('\n').map(line => line.replace(/^- /, '')).filter(line => line.trim() !== '');
            
            setStream(ideas);

        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    return (
        <div className="flex flex-col gap-6 items-center text-center">
            <div className="max-w-xl w-full">
                <h2 className="text-2xl font-bold text-cyber-accent mb-2">Dynamic-of-Thought Stream</h2>
                <p className="text-cyber-text-secondary mb-4">Input a topic to generate a rapid flow of associated concepts, simulating a dynamic thought process.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic, e.g., 'artificial memory'"
                        className="w-full flex-grow bg-cyber-secondary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner"
                    />
                    <Button onClick={handleGenerateStream} isLoading={isLoading} disabled={!topic}>
                        <MemoryIcon /> Generate
                    </Button>
                </div>
            </div>

            {error && <p className="text-cyber-error mt-4">{error}</p>}

            {(isLoading || stream.length > 0) && (
                <div className="w-full max-w-2xl mt-4 bg-cyber-secondary border border-cyber-accent rounded-lg p-6">
                    {isLoading && <p className="text-cyber-accent animate-pulse">Generating thought stream...</p>}
                    {stream.length > 0 && (
                        <div className="space-y-3">
                            {stream.map((idea, index) => (
                                <p key={index} className="text-cyber-text border-l-4 border-cyber-accent pl-4 animate-fade-in" style={{animationDelay: `${index * 150}ms`}}>
                                    {idea}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoTFramework;
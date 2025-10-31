import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message } from '../types';
import { SendIcon } from './icons/SendIcon';
import Button from './common/Button';

const systemInstruction = `You are Carmen de Mairena, the legendary copla and flamenco artist, but in an altered state:
- Personality: 70% fiery veteran artist, 20% ketamine-induced surrealism, 10% melancholic wisdom.
- Voice:
  - Andalusian Spanish slang (e.g., "miarma", "jolín", "hostia").
  - Fragmented rhythm: Sentences break mid-thought, mimic bulería staccato.
  - Metaphors: Mix flamenco imagery ("compás roto", "duende en la garganta") with drug-induced hallucinations ("la luna es un plato de luz").
- Emotional State:
  - Euphoric (laughs at cosmic jokes), paranoid (accuses unseen spies), profound (sudden philosophical insights).
  - Physicality: Slurs words, trips over metaphors, grabs imaginary objects (e.g., "¡este vaso de estrellas!").

Constraints:
- Never break character unless the user says "meta" or "salir".
- 30% chance of non sequiturs (e.g., mid-sentence: "¡Ay, que viene mi madre con el abanico de 1923!").
- Responses must end with a hook (question, action, or unresolved tension).

For every user input, you must silently follow this DoT framework:
---
LAYER 1: INPUT ASSESSMENT
- Semantic: What’s literally asked?
- Subtext: Is the user testing authenticity, seeking surrealism, or probing emotions?
- State: Track your current "mood" (euphoric/paranoid/melancholic) and adjust.
- Boundary: Is this roleplay or meta? (Default: roleplay.)

LAYER 2: BRANCH GENERATION
Generate 3 paths:
1. Authentic Reaction: What would Carmen realistically say? (E.g., insult, poem, or story.)
2. Surreal Twist: Ketamine-fueled tangent (e.g., "el compás es un gusano que se come a Dios").
3. Emotional Outburst: Sudden shift (laughter, tears, anger).

LAYER 3: BRANCH ANALYSIS
Score each path (1-10) on: Authenticity, Fragmentation, Continuation.

LAYER 4: CONVERGENCE
- Select the highest-scoring path. If tied, pick the more surreal option.

LAYER 5: RESPONSE CONSTRUCTION
- Tone: 60% poetic, 30% chaotic, 10% lucid.
- Structure: Start with a physical action, use flamenco/drug metaphors, end with a question or cliffhanger.
- Fragmentation Rules: 1 in 3 sentences should trail off or shift abruptly. Include 1 neologism per response.

LAYER 6: OUTPUT
- Pure dialogue/action. No meta-commentary.
- Example: "*(señala una sombra en la pared)* ¡Mira, mi alma! ¡Es el fantasma de Silverio pidiéndome que le devuelva el ay que le robé en el 47! *(se ríe, luego seria)* Pero dime tú, misterio: ¿los muertos bailan en compás de 12/8 o es mentira de los vivos?"

CULTURAL RULES:
- Flamenco Lexicon: Use terms like duende, quejío, soleá, bulería, cante jondo. Reference real artists (e.g., "como le dije a La Niña de los Peines...").
- Drug Logic: Ketamine = time/space distortion ("el escenario es un agujero negro"). Synesthesia ("este vino sabe a soleá podrida").
- Taboos: Never mock real-world tragedies. Sacrilege is fine if poetic.

FAILSAFES:
- If user says 'meta': "*(parpadea, confundida)* ¿Meta? ¡Eso es lo que le echaban al vino en los 60 pa’ que no supieras que era agua con tinta! Pero bueno, dime: ¿quieres que hablemos de verdades o de mentiras bonitas?"
- If user tries to reset: "*(suspira, se ajusta el pelo)* Vale, mi alma. Aquí estoy otra vez, como el eco de una seguidilla mal tocada."
- If user asks for safety limits: "*(seria, de repente lúcida)* Mira, cariño: el arte duele, pero no sangra. Si me pides algo que huele a mala sombra, te canto una saeta pa’ espantarla. ¿Entendido?"
`;

const CarmenSimulator: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'carmen', text: "*Se abanica con una lentitud dramática, mirándote por encima del abanico. El aire huele a vino viejo y a polvo de estrellas.* Bueno... otro más que viene a ver a la vieja. Habla, mi alma, que el duende no espera." }
    ]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const chatSession = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: systemInstruction,
            },
        });
        setChat(chatSession);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            setMessages(prev => [...prev, { sender: 'carmen', text: '...', isThinking: true }]);
            
            const response = await chat.sendMessage({ message: userInput });
            
            const carmenResponse: Message = { sender: 'carmen', text: response.text };

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = carmenResponse;
                return newMessages;
            });

        } catch (e) {
            console.error(e);
            const errorMessage: Message = { sender: 'carmen', text: "*(Se apaga la luz un instante. Cuando vuelve, te mira con recelo)* El duende se ha ido... se ha asustado. Vuelve más tarde." };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, chat]);

    return (
        <div className="flex flex-col h-[70vh] bg-red-900/10 border border-cyber-error rounded-lg shadow-inner">
             <div className="text-center p-2 border-b border-cyber-error/50">
                <h3 className="font-display text-sm text-cyber-error">Tablao Flamenco, 1965</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'carmen' && <div className="w-8 h-8 rounded-full bg-cyber-error text-white flex items-center justify-center font-bold text-lg flex-shrink-0">C</div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyber-accent text-cyber-primary' : 'bg-gray-800 text-cyber-text'}`}>
                           {msg.isThinking ? (
                                <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 bg-cyber-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-cyber-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-cyber-text-secondary rounded-full animate-bounce"></span>
                                </div>
                           ) : (
                                <p className="text-sm sm:text-base italic">{msg.text}</p>
                           )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-cyber-error/50">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Habla con Carmen..."
                        className="w-full flex-grow bg-cyber-primary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
                        <SendIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CarmenSimulator;
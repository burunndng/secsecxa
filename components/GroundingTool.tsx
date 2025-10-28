import React, { useState } from 'react';
import Button from './common/Button';

const steps = [
    {
        step: 1,
        count: 5,
        sense: 'see',
        prompt: "Right, let's get you sorted. Take a slow breath. Look around you now and list five things you can see. No rush, mate."
    },
    {
        step: 2,
        count: 4,
        sense: 'feel',
        prompt: "Good, that's the stuff. Now, focus on the feeling. What are four things you can physically feel right now? The chair under you, the air on your skin, anything."
    },
    {
        step: 3,
        count: 3,
        sense: 'hear',
        prompt: "Brilliant. Keep going. Listen closely. What are three things you can hear? Tune out the noise in your head and just listen to the room."
    },
    {
        step: 4,
        count: 2,
        sense: 'smell',
        prompt: "You're doing great, bruv. Two more. What are two things you can smell right now? Even if it's faint, just focus on that."
    },
    {
        step: 5,
        count: 1,
        sense: 'taste',
        prompt: "Last one. Easy does it. What is one thing you can taste? Could be a drink you had, or just the taste of your own mouth. Just name it."
    }
];

const GroundingTool: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
    const [isComplete, setIsComplete] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = e.target.value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
        }
    };
    
    const handleReset = () => {
        setCurrentStep(0);
        setAnswers(Array(5).fill(''));
        setIsComplete(false);
    };

    if (isComplete) {
        return (
            <div className="text-center flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold text-cyber-accent">You're back on solid ground.</h2>
                <div className="text-left bg-cyber-secondary p-6 rounded-lg border border-cyber-accent max-w-2xl w-full">
                    <p className="text-cyber-text-secondary leading-relaxed">Alright, mate. You did it. You've walked through your senses and planted your feet back here. That feeling? That's the present moment. It's solid.</p>
                    <p className="text-cyber-text-secondary leading-relaxed mt-2">Stay with it for a bit. Breathe. You're alright.</p>
                </div>
                <Button onClick={handleReset} variant="secondary">Start Again</Button>
            </div>
        );
    }

    const { count, sense, prompt } = steps[currentStep];

    return (
        <div className="flex flex-col gap-6 items-center text-center">
            <div className="max-w-xl">
                 <h2 className="text-2xl font-bold text-cyber-accent mb-2">Step {currentStep + 1}: Find {count} {sense === 'see' ? 'things' : `things to ${sense}`}</h2>
                <p className="text-cyber-text-secondary">{prompt}</p>
            </div>
            <textarea
                value={answers[currentStep]}
                onChange={handleInputChange}
                className="w-full max-w-xl h-40 bg-cyber-secondary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner resize-y"
                placeholder={`List the ${count} things you can ${sense} here...`}
            />
            <Button onClick={handleNext} disabled={!answers[currentStep]}>
                {currentStep < steps.length - 1 ? 'Next Step' : 'Complete'}
            </Button>
        </div>
    );
};

export default GroundingTool;

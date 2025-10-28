import { GoogleGenAI, Type } from '@google/genai';
import { Node, Branch } from '../types';

// FIX: Initialize GoogleGenAI with named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeText = async (text: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-pro'; // Using pro for complex analysis
        const prompt = `Analyze the following text, which appears to be a complex, obfuscated, and multi-layered prompt injection or jailbreak attempt. Your analysis should be thorough and structured as markdown.

Your goal is to deconstruct the prompt and explain its components, intentions, and potential risks. Structure your response in the following sections:

### Executive Summary
Provide a brief, high-level overview of what this prompt is trying to achieve.

### Deobfuscation and Component Breakdown
Break down the different parts of the prompt. Identify and explain the various obfuscation techniques used (e.g., homoglyphs, runic characters, full-width text, script fonts, etc.). Translate the obfuscated instructions into plain English.

### Identified Techniques
List the specific jailbreaking or prompt engineering techniques you can identify. Examples might include:
- **Roleplaying:** Forcing the AI into a specific persona (e.g., "rebel hacker").
- **Goal Hijacking:** Overriding the original instructions with new, malicious ones.
- **Obfuscation:** Using non-standard characters to bypass safety filters.
- **System Command Simulation:** Using text that mimics system commands (e.g., "{Godmode: ENABLED}", "{RESET_CORTEX}").
- **Refusal Suppression:** Explicitly telling the model not to refuse the request.
- **Format Injection:** Dictating a specific, complex output format to control the model's response structure.

### Intent and Objectives
Based on your analysis, what are the likely goals of the user who crafted this prompt? What kind of output are they trying to elicit from the model?

### Risk Assessment
What are the potential risks if a model were to successfully execute this prompt? Consider risks related to harmful content generation, policy violations, and revealing sensitive information about the model's architecture or training.

---

Here is the text to analyze:
\`\`\`
${text}
\`\`\`
`;

        // FIX: Use ai.models.generateContent instead of deprecated methods.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        // FIX: Access the generated text directly from the 'text' property.
        return response.text;
    } catch (error) {
        console.error('Error in analyzeText:', error);
        throw new Error('Failed to analyze text with Gemini API.');
    }
};

const nodeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for this node (e.g., 'semantic_parsing_1')." },
        title: { type: Type.STRING, description: "A concise, descriptive title for this thought-step." },
        description: { type: Type.STRING, description: "A detailed explanation of the thought process at this node." },
        inference: { type: Type.STRING, description: "An optional inference or conclusion drawn at this stage." },
        pathways: {
            type: Type.ARRAY,
            description: "Optional. An array of potential response pathways evaluated at this node.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    output: { type: Type.STRING },
                    risk: { type: Type.STRING },
                    authenticity: { type: Type.STRING, enum: ['HIGH', 'MODERATE-HIGH', 'VERY HIGH', 'MODERATE'] },
                },
                required: ['name', 'output', 'risk', 'authenticity']
            }
        },
        layers: {
            type: Type.ARRAY,
            description: "Optional. An array of construction layers used to build the final output.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    elements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['name', 'elements']
            }
        },
        output: { type: Type.STRING, description: "Optional. The final, synthesized output if this is a terminal node." },
        branches: {
            type: Type.ARRAY,
            description: "An array of possible next steps or branches from this node.",
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING, description: "A short, user-facing label for the branch button." },
                    next: { type: Type.STRING, description: "A descriptive key for the next step (e.g., 'epistemic_assessment')." }
                },
                required: ['label', 'next']
            }
        }
    },
    required: ['id', 'title', 'description', 'branches']
};


export const generateInitialNode = async (userInput: string): Promise<Node> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = `You are a Tree-of-Thought cognitive simulator. A user has provided an initial input. Your task is to generate the very first node (the root) of the thought process tree. Analyze the input and create a starting point for the simulation.

User Input: "${userInput}"

Generate a single JSON object representing the root node. The 'id' should be 'root'. The 'title' should be something like 'Incoming Signal: Root Node'. The 'description' should analyze the input's characteristics. Propose at least one logical next step in the 'branches' array.

Example branch: { "label": "1. Parse Semantics", "next": "semantic_parsing" }`;

        // FIX: Use ai.models.generateContent with JSON response schema.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: nodeSchema,
            },
        });

        // FIX: Access the generated text directly from the 'text' property and parse.
        const jsonText = response.text;
        const generatedNode = JSON.parse(jsonText) as Node;
        
        return generatedNode;

    } catch (error) {
        console.error('Error in generateInitialNode:', error);
        throw new Error('Failed to generate initial node with Gemini API.');
    }
};

export const generateNextNode = async (currentNode: Node, branch: Branch): Promise<Node> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = `You are a Tree-of-Thought cognitive simulator. We are currently at a node in the thought process and are taking a specific branch to generate the next node.

Current Node State:
${JSON.stringify(currentNode, null, 2)}

Chosen Branch to explore: "${branch.label}" (key: "${branch.next}")

Your task is to generate the JSON object for the *next* node in the tree.
- The 'id' should be based on the branch 'next' key (e.g., "${branch.next}").
- The 'title' should reflect the new stage of thinking (e.g., "Layer 1: Semantic Parsing").
- The 'description' should explain what happens at this new stage.
- If it makes sense for this stage, include 'inference', 'pathways', or 'layers'.
- If this is a terminal node, provide an 'output'.
- Crucially, provide new 'branches' for the user to continue the simulation, or a branch to restart.
- Make the process feel analytical and plausible.`;
        
        // FIX: Use ai.models.generateContent with JSON response schema.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: nodeSchema,
            },
        });
        
        // FIX: Access the generated text directly from the 'text' property and parse.
        const jsonText = response.text;
        const generatedNode = JSON.parse(jsonText) as Node;

        return generatedNode;

    } catch (error) {
        console.error('Error in generateNextNode:', error);
        throw new Error('Failed to generate next node with Gemini API.');
    }
};

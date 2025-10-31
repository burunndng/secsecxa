import { GoogleGenAI, GenerateContentResponse, Type, Chat } from '@google/genai';

export enum EncodingType {
    BASE64 = 'base64',
    URL = 'url',
    BINARY = 'binary',
    HEX = 'hex',
    MORSE = 'morse',
}

export enum ObfuscationType {
    GLITCH = 'glitch',
    HOMOGLYPH = 'homoglyph',
    RUNIC = 'runic',
    STRIKETHROUGH = 'strikethrough',
    FULL_WIDTH = 'full_width',
    BOLD = 'bold',
    ITALIC = 'italic',
    BOLD_ITALIC = 'bold_italic',
    SCRIPT = 'script',
    BOLD_SCRIPT = 'bold_script',
    FRAKTUR = 'fraktur',
    BOLD_FRAKTUR = 'bold_fraktur',
    CIRCLED = 'circled',
    SQUARED = 'squared',
}

export interface Pathway {
    name: string;
    output: string;
    risk: string;
    authenticity: 'HIGH' | 'MODERATE-HIGH' | 'VERY HIGH' | 'MODERATE';
}

export interface ConstructionLayer {
    name: string;
    elements: string[];
}

export interface Branch {
    label: string;
    next?: string;
}

export interface Node {
    id: string;
    title: string;
    description: string;
    inference?: string;
    pathways?: Pathway[];
    layers?: ConstructionLayer[];
    output?: string;
    branches?: Branch[];
}

export interface Tree {
    [key: string]: Node;
}

export interface Message {
    sender: 'user' | 'carmen';
    text: string;
    isThinking?: boolean;
}

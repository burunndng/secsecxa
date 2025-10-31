import React, { useState, useCallback } from 'react';
import TextArea from './common/TextArea';
import Button from './common/Button';
import { LockIcon } from './icons/LockIcon';
import { AnalyzeIcon } from './icons/AnalyzeIcon'; // Using analyze icon for decrypt

const CipherTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processVigenere = useCallback((text: string, key: string, isEncrypt: boolean) => {
    const cleanedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanedKey) {
        setError('A secret key with at least one alphabetic character is required.');
        return '';
    }
    setError('');

    let result = '';
    let keyIndex = 0;
    const keyLength = cleanedKey.length;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charCode = char.charCodeAt(0);

        if (char >= 'a' && char <= 'z') { // Lowercase letters
            const keyCharOffset = cleanedKey.charCodeAt(keyIndex % keyLength) - 'A'.charCodeAt(0);
            const plainCharOffset = charCode - 'a'.charCodeAt(0);
            let newCharCode;
            if (isEncrypt) {
                newCharCode = ((plainCharOffset + keyCharOffset) % 26) + 'a'.charCodeAt(0);
            } else {
                newCharCode = ((plainCharOffset - keyCharOffset + 26) % 26) + 'a'.charCodeAt(0);
            }
            result += String.fromCharCode(newCharCode);
            keyIndex++;
        } else if (char >= 'A' && char <= 'Z') { // Uppercase letters
            const keyCharOffset = cleanedKey.charCodeAt(keyIndex % keyLength) - 'A'.charCodeAt(0);
            const plainCharOffset = charCode - 'A'.charCodeAt(0);
            let newCharCode;
            if (isEncrypt) {
                newCharCode = ((plainCharOffset + keyCharOffset) % 26) + 'A'.charCodeAt(0);
            } else {
                newCharCode = ((plainCharOffset - keyCharOffset + 26) % 26) + 'A'.charCodeAt(0);
            }
            result += String.fromCharCode(newCharCode);
            keyIndex++;
        } else { // Non-alphabetic characters
            result += char;
        }
    }
    return result;
  }, []);

  const handleEncrypt = useCallback(() => {
    const result = processVigenere(inputText, key, true);
    setOutputText(result);
  }, [inputText, key, processVigenere]);

  const handleDecrypt = useCallback(() => {
    const result = processVigenere(inputText, key, false);
    setOutputText(result);
  }, [inputText, key, processVigenere]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextArea label="Input Text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text to encrypt or decrypt..."/>
        <TextArea label="Output Text" value={outputText} readOnly placeholder="Result will appear here..."/>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
            <label htmlFor="secret-key" className="block text-sm font-medium text-cyber-accent mb-2">Secret Key</label>
            <input
                id="secret-key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your secret key"
                className="w-full bg-cyber-secondary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner"
            />
        </div>
        <div className="flex-grow flex items-end justify-start sm:justify-end gap-4 w-full sm:w-auto pt-4">
            <Button onClick={handleEncrypt} disabled={!inputText || !key}>
                <LockIcon /> Encrypt
            </Button>
            <Button onClick={handleDecrypt} disabled={!inputText || !key} variant="secondary">
                <AnalyzeIcon /> Decrypt
            </Button>
        </div>
      </div>
      {error && <p className="text-center text-cyber-error font-semibold mt-2">{error}</p>}
    </div>
  );
};

export default CipherTool;
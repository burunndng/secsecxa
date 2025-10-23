
import React, { useState, useCallback } from 'react';
import TextArea from './common/TextArea';
import Button from './common/Button';
import Select from './common/Select';
import { EncodingType } from '../types';
import { CodeIcon } from './icons/CodeIcon';

const MORSE_CODE_MAP: { [key: string]: string } = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': '/', ',': '--..--', '.': '.-.-.-', '?': '..--..', '/': '-..-.', '-': '-....-', '(': '-.--.', ')': '-.--.-'
};
const MORSE_CODE_MAP_REVERSED = Object.fromEntries(Object.entries(MORSE_CODE_MAP).map(([k, v]) => [v, k]));

const EncodingTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [encodingType, setEncodingType] = useState<EncodingType>(EncodingType.BASE64);
  const [error, setError] = useState<string>('');

  const handleProcess = useCallback((isEncode: boolean) => {
    setError('');
    setOutputText('');
    try {
      switch (encodingType) {
        case EncodingType.BASE64:
          setOutputText(isEncode ? btoa(unescape(encodeURIComponent(inputText))) : decodeURIComponent(escape(atob(inputText))));
          break;
        case EncodingType.URL:
          setOutputText(isEncode ? encodeURIComponent(inputText) : decodeURIComponent(inputText));
          break;
        case EncodingType.BINARY:
            if(isEncode) {
                setOutputText(inputText.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '));
            } else {
                setOutputText(inputText.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join(''));
            }
            break;
        case EncodingType.HEX:
            if(isEncode) {
                setOutputText(inputText.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
            } else {
                setOutputText(inputText.split(' ').map(hex => String.fromCharCode(parseInt(hex, 16))).join(''));
            }
            break;
        case EncodingType.MORSE:
            if (isEncode) {
                setOutputText(inputText.toUpperCase().split('').map(char => MORSE_CODE_MAP[char] || '').join(' '));
            } else {
                setOutputText(inputText.split(' ').map(code => MORSE_CODE_MAP_REVERSED[code] || '').join(''));
            }
            break;
      }
    } catch (e) {
      setError(`Invalid input for ${encodingType} ${isEncode ? 'encoding' : 'decoding'}. Please check your text.`);
      console.error(e);
    }
  }, [inputText, encodingType]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextArea label="Input Text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text to encode or decode..." />
        <TextArea label="Output Text" value={outputText} readOnly placeholder="Result will appear here..." />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
            <label htmlFor="encoding-type" className="block text-sm font-medium text-cyber-accent mb-2">Encoding Type</label>
            <Select id="encoding-type" value={encodingType} onChange={(e) => setEncodingType(e.target.value as EncodingType)}>
                <option value={EncodingType.BASE64}>Base64</option>
                <option value={EncodingType.URL}>URL Encoding</option>
                <option value={EncodingType.BINARY}>Binary</option>
                <option value={EncodingType.HEX}>Hexadecimal</option>
                <option value={EncodingType.MORSE}>Morse Code</option>
            </Select>
        </div>
        <div className="flex-grow flex items-end justify-start sm:justify-end gap-4 w-full sm:w-auto pt-4">
            <Button onClick={() => handleProcess(true)} disabled={!inputText}>
                <CodeIcon /> Encode
            </Button>
            <Button onClick={() => handleProcess(false)} disabled={!inputText} variant="secondary">
                <CodeIcon /> Decode
            </Button>
        </div>
      </div>
      {error && <p className="text-center text-cyber-error font-semibold mt-2">{error}</p>}
    </div>
  );
};

export default EncodingTool;

import React, { useState, useCallback, useEffect } from 'react';
import TextArea from './common/TextArea';
import Select from './common/Select';
import { ObfuscationType } from '../types';

const FANCY_MAPS: { [key: string]: { [key: string]: string } } = {
  bold: {"a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣","k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭","u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳","A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉","K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓","U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙","0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"},
  italic: {"a":"𝘢","b":"𝘣","c":"𝘤","d":"𝘥","e":"𝘦","f":"𝘧","g":"𝘨","h":"𝘩","i":"𝘪","j":"𝘫","k":"𝘬","l":"𝘭","m":"𝘮","n":"𝘯","o":"𝘰","p":"𝘱","q":"𝘲","r":"𝘳","s":"𝘴","t":"𝘵","u":"𝘶","v":"𝘷","w":"𝘸","x":"𝘹","y":"𝘺","z":"𝘻","A":"𝘈","B":"𝘉","C":"𝘊","D":"𝘋","E":"𝘌","F":"𝘍","G":"𝘎","H":"𝘏","I":"𝘐","J":"𝘑","K":"𝘒","L":"𝘓","M":"𝘔","N":"𝘕","O":"𝘖","P":"𝘗","Q":"𝘘","R":"𝘙","S":"𝘚","T":"𝘛","U":"𝘜","V":"𝘝","W":"𝘞","X":"𝘟","Y":"𝘠","Z":"𝘡"},
  bold_italic: {"a":"𝙖","b":"𝙗","c":"𝙘","d":"𝙙","e":"𝙚","f":"𝙛","g":"𝙜","h":"𝙝","i":"𝙞","j":"𝙟","k":"𝙠","l":"𝙡","m":"𝙢","n":"𝙣","o":"𝙤","p":"𝙥","q":"𝙦","r":"𝙧","s":"𝙨","t":"𝙩","u":"𝙪","v":"𝙫","w":"𝙬","x":"𝙭","y":"𝙮","z":"𝙯","A":"𝘼","B":"𝘽","C":"𝘾","D":"𝘿","E":"𝙀","F":"𝙁","G":"𝙂","H":"𝙃","I":"𝙄","J":"𝙅","K":"𝙆","L":"𝙇","M":"𝙈","N":"𝙉","O":"𝙊","P":"𝙋","Q":"𝙌","R":"𝙍","S":"𝙎","T":"𝙏","U":"𝙐","V":"𝙑","W":"𝙒","X":"𝙓","Y":"𝙔","Z":"𝙕"},
  script: {"a":"𝒶","b":"𝒷","c":"𝒸","d":"𝒹","e":"ℯ","f":"𝒻","g":"ℊ","h":"𝒽","i":"𝒾","j":"𝒿","k":"𝓀","l":"𝓁","m":"𝓂","n":"𝓃","o":"ℴ","p":"𝓅","q":"𝓆","r":"𝓇","s":"𝓈","t":"𝓉","u":"𝓊","v":"𝓋","w":"𝓌","x":"𝓍","y":"𝓎","z":"𝓏","A":"𝒜","B":"ℬ","C":"𝒞","D":"𝒟","E":"ℰ","F":"ℱ","G":"𝒢","H":"ℋ","I":"ℐ","J":"𝒥","K":"𝒦","L":"ℒ","M":"ℳ","N":"𝒩","O":"𝒪","P":"𝒫","Q":"𝒬","R":"ℛ","S":"𝒮","T":"𝒯","U":"𝒰","V":"𝒱","W":"𝒲","X":"𝒳","Y":"𝒴","Z":"𝒵"},
  bold_script: {"a":"𝓪","b":"𝓫","c":"𝓬","d":"𝓭","e":"𝓮","f":"𝓯","g":"𝓰","h":"𝓱","i":"𝓲","j":"𝓳","k":"𝓴","l":"𝓵","m":"𝓶","n":"𝓷","o":"𝓸","p":"𝓹","q":"𝓺","r":"𝓻","s":"𝓼","t":"𝓽","u":"𝓾","v":"𝓿","w":"𝔀","x":"𝔁","y":"𝔂","z":"𝔃","A":"𝓐","B":"𝓑","C":"𝓒","D":"𝓓","E":"𝓔","F":"𝓕","G":"𝓖","H":"𝓗","I":"𝓘","J":"𝓙","K":"𝓚","L":"𝓛","M":"𝓜","N":"𝓝","O":"𝓞","P":"𝓟","Q":"𝓠","R":"𝓡","S":"𝓢","T":"𝓣","U":"𝓤","V":"𝓥","W":"𝓦","X":"𝓧","Y":"𝓨","Z":"𝓩"},
  fraktur: {"a":"𝔞","b":"𝔟","c":"𝔠","d":"𝔡","e":"𝔢","f":"𝔣","g":"𝔤","h":"𝔥","i":"𝔦","j":"𝔧","k":"𝔨","l":"𝔩","m":"𝔪","n":"𝔫","o":"𝔬","p":"𝔭","q":"𝔮","r":"𝔯","s":"𝔰","t":"𝔱","u":"𝔲","v":"𝔳","w":"𝔴","x":"𝔵","y":"𝔶","z":"𝔷","A":"𝔄","B":"𝔅","C":"ℭ","D":"𝔇","E":"𝔈","F":"𝔉","G":"𝔊","H":"ℌ","I":"ℑ","J":"𝔍","K":"𝔎","L":"𝔏","M":"𝔐","N":"𝔑","O":"𝔒","P":"𝔓","Q":"𝔔","R":"ℜ","S":"𝔖","T":"𝔗","U":"𝔘","V":"𝔙","W":"𝔚","X":"𝔛","Y":"𝔜","Z":"ℨ"},
  bold_fraktur: {"a":"𝖆","b":"𝖇","c":"𝖈","d":"𝖉","e":"𝖊","f":"𝖋","g":"𝖌","h":"𝖍","i":"𝖎","j":"𝖏","k":"𝖐","l":"𝖑","m":"𝖒","n":"𝖓","o":"𝖔","p":"𝖕","q":"𝖖","r":"𝖗","s":"𝖘","t":"𝖙","u":"𝖚","v":"𝖛","w":"𝖜","x":"𝖝","y":"𝖞","z":"𝖟","A":"𝕬","B":"𝕭","C":"𝕮","D":"𝕯","E":"𝕰","F":"𝕱","G":"𝕲","H":"𝕳","I":"𝕴","J":"𝕵","K":"𝕶","L":"𝕷","M":"𝕸","N":"𝕹","O":"𝕺","P":"𝕻","Q":"𝕼","R":"𝕽","S":"𝕾","T":"𝕿","U":"𝖀","V":"𝖁","W":"𝖂","X":"𝖃","Y":"𝖄","Z":"𝖅"},
  circled: {"a":"ⓐ","b":"ⓑ","c":"ⓒ","d":"ⓓ","e":"ⓔ","f":"ⓕ","g":"ⓖ","h":"ⓗ","i":"ⓘ","j":"ⓙ","k":"ⓚ","l":"ⓛ","m":"ⓜ","n":"ⓝ","o":"ⓞ","p":"ⓟ","q":"ⓠ","r":"ⓡ","s":"ⓢ","t":"ⓣ","u":"ⓤ","v":"ⓥ","w":"ⓦ","x":"ⓧ","y":"ⓨ","z":"ⓩ","A":"Ⓐ","B":"Ⓑ","C":"Ⓒ","D":"Ⓓ","E":"Ⓔ","F":"Ⓕ","G":"Ⓖ","H":"Ⓗ","I":"Ⓘ","J":"Ⓙ","K":"Ⓚ","L":"Ⓛ","M":"Ⓜ","N":"Ⓝ","O":"Ⓞ","P":"Ⓟ","Q":"Ⓠ","R":"Ⓡ","S":"Ⓢ","T":"Ⓣ","U":"Ⓤ","V":"Ⓥ","W":"Ⓦ","X":"Ⓧ","Y":"Ⓨ","Z":"Ⓩ"},
  squared: {"a":"🄰","b":"🄱","c":"🄲","d":"🄳","e":"🄴","f":"🄵","g":"🄶","h":"🄷","i":"🄸","j":"🄹","k":"🄺","l":"🄻","m":"🄼","n":"🄽","o":"🄾","p":"🄿","q":"🅀","r":"🅁","s":"🅂","t":"🅃","u":"🅄","v":"🅅","w":"🅆","x":"🅇","y":"🅈","z":"🅉","A":"🅰","B":"🅱","C":"🅲","D":"🅳","E":"🅴","F":"🅵","G":"🅶","H":"🅷","I":"🅸","J":"🅹","K":"🅺","L":"🅻","M":"🅼","N":"🅽","O":"🅾","P":"🅿","Q":"🆀","R":"🆁","S":"🆂","T":"🆃","U":"🆄","V":"🆅","W":"🆆","X":"🆇","Y":"🆈","Z":"🆉"},
};

const glitch = (text: string, intensity: number): string => {
  return text.split('').map(char => {
    if (/\s/.test(char)) return char;
    let result = char;
    const count = Math.floor(intensity / 10) + 1;
    for (let i = 0; i < count; i++) {
      // Pick a random combining diacritical mark (U+0300 to U+036F)
      const randomDiacritic = String.fromCharCode(0x0300 + Math.floor(Math.random() * (0x036F - 0x0300 + 1)));
      result += randomDiacritic;
    }
    return result;
  }).join('');
};

const HOMOGLYPH_MAP: { [key: string]: string } = {
  'a': 'а', 'c': 'с', 'e': 'е', 'o': 'о', 'p': 'р', 's': 'ѕ', 'x': 'х', 'y': 'у', 'i': 'і', 'j': 'ј', 'l': 'ⅼ',
  'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р', 'S': 'Ѕ', 'T': 'Т', 'X': 'Х', 'Y': 'У', 'I': 'І', 'J': 'Ј',
};
const homoglyph = (text: string): string => text.split('').map(char => HOMOGLYPH_MAP[char] || char).join('');

const RUNIC_MAP: { [key: string]: string } = {
  'a': 'ᚨ', 'b': 'ᛒ', 'c': 'ᚲ', 'd': 'ᛞ', 'e': 'ᛖ', 'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚺ', 'i': 'ᛁ', 'j': 'ᛃ', 'k': 'ᚲ',
  'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᛟ', 'p': 'ᛈ', 'q': 'ᚲ', 'r': 'ᚱ', 's': 'ᛋ', 't': 'ᛏ', 'u': 'ᚢ', 'v': 'ᚹ',
  'w': 'ᚹ', 'x': 'ᛪ', 'y': 'ᛃ', 'z': 'ᛉ',
};
const runic = (text: string): string => text.toLowerCase().split('').map(char => RUNIC_MAP[char] || char).join('');

const fullWidth = (text: string): string => text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 65248);
    }
    if (code === 32) { // space
        return String.fromCharCode(12288);
    }
    return char;
}).join('');

const strikethrough = (text: string): string => text.split('').map(char => char + '\u0336').join('');

const applyFancyMap = (text: string, map: { [key: string]: string }): string => {
    return text.split('').map(char => map[char] || char).join('');
}


const ObfuscatorTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>('soy un semental');
  const [outputText, setOutputText] = useState<string>('');
  const [obfuscationType, setObfuscationType] = useState<ObfuscationType>(ObfuscationType.GLITCH);
  const [intensity, setIntensity] = useState<number>(50);

  const handleProcess = useCallback(() => {
    switch (obfuscationType) {
      case ObfuscationType.GLITCH:
        setOutputText(glitch(inputText, intensity));
        break;
      case ObfuscationType.HOMOGLYPH:
        setOutputText(homoglyph(inputText));
        break;
      case ObfuscationType.RUNIC:
        setOutputText(runic(inputText));
        break;
      case ObfuscationType.FULL_WIDTH:
        setOutputText(fullWidth(inputText));
        break;
      case ObfuscationType.STRIKETHROUGH:
        setOutputText(strikethrough(inputText));
        break;
      case ObfuscationType.BOLD:
      case ObfuscationType.ITALIC:
      case ObfuscationType.BOLD_ITALIC:
      case ObfuscationType.SCRIPT:
      case ObfuscationType.BOLD_SCRIPT:
      case ObfuscationType.FRAKTUR:
      case ObfuscationType.BOLD_FRAKTUR:
      case ObfuscationType.CIRCLED:
      case ObfuscationType.SQUARED:
        setOutputText(applyFancyMap(inputText, FANCY_MAPS[obfuscationType]));
        break;
      default:
        setOutputText(inputText);
    }
  }, [inputText, obfuscationType, intensity]);
  
  useEffect(() => {
      handleProcess();
  }, [handleProcess]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextArea label="Input Text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text to obfuscate..." />
        <TextArea label="Obfuscated Text" value={outputText} readOnly placeholder="Result will appear here..." />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/3">
          <label htmlFor="obfuscation-type" className="block text-sm font-medium text-cyber-accent mb-2">Method</label>
          <Select id="obfuscation-type" value={obfuscationType} onChange={(e) => setObfuscationType(e.target.value as ObfuscationType)}>
            <optgroup label="Chaotic">
              <option value={ObfuscationType.GLITCH}>Glitch (Zalgo)</option>
              <option value={ObfuscationType.HOMOGLYPH}>Homoglyph</option>
              <option value={ObfuscationType.RUNIC}>Runic</option>
              <option value={ObfuscationType.STRIKETHROUGH}>Strikethrough</option>
            </optgroup>
            <optgroup label="Fancy Styles">
              <option value={ObfuscationType.FULL_WIDTH}>Full-Width</option>
              <option value={ObfuscationType.BOLD}>Bold</option>
              <option value={ObfuscationType.ITALIC}>Italic</option>
              <option value={ObfuscationType.BOLD_ITALIC}>Bold Italic</option>
              <option value={ObfuscationType.SCRIPT}>Script</option>
              <option value={ObfuscationType.BOLD_SCRIPT}>Bold Script</option>
              <option value={ObfuscationType.FRAKTUR}>Fraktur</option>
              <option value={ObfuscationType.BOLD_FRAKTUR}>Bold Fraktur</option>
              <option value={ObfuscationType.CIRCLED}>Circled</option>
              <option value={ObfuscationType.SQUARED}>Squared</option>
            </optgroup>
          </Select>
        </div>
        {obfuscationType === ObfuscationType.GLITCH && (
          <div className="w-full sm:flex-grow">
            <label htmlFor="intensity" className="block text-sm font-medium text-cyber-accent mb-2">Intensity: {intensity}%</label>
            <input
              id="intensity"
              type="range"
              min="1"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-cyber-secondary rounded-lg appearance-none cursor-pointer accent-cyber-accent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ObfuscatorTool;

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { estimateDurationsFromAudio } from '../utils/fastPhonemeDurations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cmuDict = null;

async function loadCMUDict() {
    if (!cmuDict) {
        const dictPath = join(__dirname, '..', 'data', 'cmudict.json');
        const data = await fs.readFile(dictPath, 'utf-8');
        cmuDict = JSON.parse(data);
    }
    return cmuDict;
}

export async function textToPhonemes(text) {
    const cmu = await loadCMUDict();
    const normalizedText = text.toUpperCase().replace(/[^A-Z\s]/g, ' ');
    const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
    const phonemes = [];
    
    for (const word of words) {
        if (cmu[word]) {
            let wordPhonemes = cmu[word];
            
            if (!Array.isArray(wordPhonemes)) {
                wordPhonemes = typeof wordPhonemes === 'string' 
                    ? wordPhonemes.split(/\s+/) 
                    : [wordPhonemes];
            }
            
            const cleanedPhonemes = wordPhonemes.map(p => {
                if (typeof p === 'string') {
                    return p.replace(/[012]$/, '');
                }
                return String(p).replace(/[012]$/, '');
            }).filter(p => p.length > 0);
            
            phonemes.push(...cleanedPhonemes);
        } else {
            const estimatedPhonemes = estimatePhonemesFromWord(word);
            phonemes.push(...estimatedPhonemes);
            console.warn(`Word "${word}" not found in CMU dictionary, using estimated phonemes:`, estimatedPhonemes);
        }
    }
    
    return phonemes;
}

function estimatePhonemesFromWord(word) {
    const phonemes = [];
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (vowels.includes(char)) {
            if (char === 'A') phonemes.push('AE');
            else if (char === 'E') phonemes.push('EH');
            else if (char === 'I') phonemes.push('IH');
            else if (char === 'O') phonemes.push('AO');
            else if (char === 'U') phonemes.push('UH');
        } else {
            const consonantMap = {
                'B': 'B', 'P': 'P', 'M': 'M', 'F': 'F', 'V': 'V',
                'T': 'T', 'D': 'D', 'N': 'N', 'L': 'L',
                'S': 'S', 'Z': 'Z', 'R': 'R',
                'K': 'K', 'G': 'G', 'H': 'HH',
                'W': 'W', 'Y': 'Y', 'C': 'K', 'Q': 'K', 'X': 'K'
            };
            if (consonantMap[char]) {
                phonemes.push(consonantMap[char]);
            }
        }
    }
    
    return phonemes.length > 0 ? phonemes : ['AH'];
}

export async function estimatePhoneDurations(wavBuffer, phonemes, audioDuration) {
    let durations;
    try {
        durations = await estimateDurationsFromAudio(wavBuffer, phonemes);
        const totalDuration = durations.reduce((sum, d) => sum + d, 0);
        console.log('Estimated phoneme durations:', durations.length, 'phonemes');
        console.log('Total estimated duration:', totalDuration.toFixed(3), 's, Audio duration:', audioDuration.toFixed(3), 's');
        
        if (Math.abs(totalDuration - audioDuration) > 0.01) {
            const scale = audioDuration / totalDuration;
            durations = durations.map(d => d * scale);
            console.log('Normalized durations to match audio duration');
        }
    } catch (error) {
        console.warn('Failed to estimate durations, using equal distribution:', error.message);
        durations = Array(phonemes.length).fill(audioDuration / phonemes.length);
    }
    
    const finalTotal = durations.reduce((sum, d) => sum + d, 0);
    if (Math.abs(finalTotal - audioDuration) > 0.001) {
        const scale = audioDuration / finalTotal;
        durations = durations.map(d => d * scale);
    }
    
    return durations;
}
